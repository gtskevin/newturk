"""
LLM Executor Service for Participant Simulation
"""
import json
import re
from typing import Any

from openai import OpenAI


class LLMExecutor:
    """
    Execute participant simulations using OpenAI LLM API
    """

    # Default model pricing (cost per 1K tokens)
    DEFAULT_PRICING = {
        "gpt-4o": {"input": 0.005, "output": 0.005},
        "gpt-4-turbo": {"input": 0.01, "output": 0.03},
        "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
    }

    def __init__(
        self,
        api_key: str,
        model: str = "gpt-4o",
        temperature: float = 0.8,
        max_tokens: int = 2000,
        input_cost_per_1k: float | None = None,
        output_cost_per_1k: float | None = None,
    ):
        """
        Initialize LLM Executor

        Args:
            api_key: OpenAI API key
            model: Model name (default: gpt-4o)
            temperature: Sampling temperature (default: 0.8 for realistic responses)
            max_tokens: Maximum tokens in response (default: 2000)
            input_cost_per_1k: Custom input cost per 1K tokens
            output_cost_per_1k: Custom output cost per 1K tokens
        """
        self.api_key = api_key
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens

        # Set pricing
        if model in self.DEFAULT_PRICING:
            self.input_cost_per_1k = input_cost_per_1k or self.DEFAULT_PRICING[model]["input"]
            self.output_cost_per_1k = output_cost_per_1k or self.DEFAULT_PRICING[model]["output"]
        else:
            # Use custom pricing or defaults
            self.input_cost_per_1k = input_cost_per_1k or 0.005
            self.output_cost_per_1k = output_cost_per_1k or 0.005

        # Initialize OpenAI client
        self.client = OpenAI(api_key=api_key)

    def _build_prompt(self, profile: dict[str, Any], questions: list[dict[str, Any]]) -> str:
        """
        Build persona-based prompt for LLM

        Args:
            profile: Participant profile dict
            questions: List of question dicts

        Returns:
            Formatted prompt string
        """
        # Extract profile information
        participant_number = profile.get("participant_number", "Unknown")
        age = profile.get("age", "Unknown")
        gender = profile.get("gender", "Unknown")
        country = profile.get("country", "Unknown")
        education = profile.get("education", "Unknown")
        language = profile.get("language", "Unknown")
        life_stage = profile.get("life_stage", "Unknown")

        # Build persona description
        persona = f"""You are simulating Participant #{participant_number}, with the following profile:

- Age: {age} years old
- Gender: {gender}
- Country: {country}
- Native Language: {language}
- Education Level: {education}
- Life Stage: {life_stage}

IMPORTANT: Respond in character as this participant. Consider their age, education, cultural background, and life stage when formulating your answers. Be realistic and nuanced in your responses."""

        # Build questions section
        questions_text = "\n\nPlease answer the following questions:\n\n"
        for q in questions:
            question_id = q.get("question_id", "")
            question_text = q.get("question_text", "")
            question_type = q.get("question_type", "")
            options = q.get("options", {})

            questions_text += f"Question ID: {question_id}\n"
            questions_text += f"{question_text}\n"

            # Add options context based on question type
            if question_type == "multiple_choice" and "choices" in options:
                questions_text += f"Options: {', '.join(options['choices'])}\n"
            elif question_type == "likert_scale":
                min_val = options.get("min", 1)
                max_val = options.get("max", 5)
                labels = options.get("labels", [])
                if labels:
                    questions_text += f"Scale: {min_val} ({labels[0]}) to {max_val} ({labels[-1]})\n"
                else:
                    questions_text += f"Scale: {min_val} to {max_val}\n"
            elif question_type == "yes_no":
                questions_text += "Please respond with either 'Yes' or 'No'\n"
            elif question_type == "open_ended":
                questions_text += "Provide a detailed, thoughtful response\n"

            questions_text += "\n"

        # Build response format instructions
        format_instructions = """
Respond in JSON format with the following structure:
```json
{
    "question_id_1": {
        "response": "your answer here",
        "confidence": "high|medium|low"
    },
    "question_id_2": {
        "response": "your answer here",
        "confidence": "high|medium|low"
    }
}
```

Make sure to include ALL questions in your response. The "response" field should contain your actual answer, and "confidence" indicates how confident you are in your answer."""

        # Combine all sections
        prompt = f"{persona}\n{questions_text}{format_instructions}"

        return prompt

    def _parse_response(self, raw_response: str, question_ids: list[str]) -> dict[str, Any]:
        """
        Parse LLM response into structured data

        Args:
            raw_response: Raw response string from LLM
            question_ids: List of expected question IDs

        Returns:
            Parsed response dict

        Raises:
            ValueError: If response cannot be parsed as JSON
        """
        try:
            # Try to extract JSON from markdown code blocks
            json_match = re.search(r"```json\s*(.*?)\s*```", raw_response, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                # Try without markdown
                json_match = re.search(r"```\s*(.*?)\s*```", raw_response, re.DOTALL)
                if json_match:
                    json_str = json_match.group(1)
                else:
                    # Use the whole response as JSON
                    json_str = raw_response.strip()

            # Parse JSON
            parsed = json.loads(json_str)

            # Validate that we got responses for at least some questions
            if not isinstance(parsed, dict):
                raise ValueError("Response is not a JSON object")

            # Filter to only requested questions
            filtered_responses = {
                qid: parsed[qid] for qid in question_ids if qid in parsed
            }

            return filtered_responses

        except (json.JSONDecodeError, ValueError) as e:
            raise ValueError(f"Failed to parse LLM response: {str(e)}")

    def _calculate_cost(self, prompt_tokens: int, completion_tokens: int) -> float:
        """
        Calculate token cost

        Args:
            prompt_tokens: Number of input tokens
            completion_tokens: Number of output tokens

        Returns:
            Cost in USD
        """
        input_cost = (prompt_tokens * self.input_cost_per_1k) / 1000
        output_cost = (completion_tokens * self.output_cost_per_1k) / 1000
        return input_cost + output_cost

    def execute_participant(
        self, profile: dict[str, Any], questions: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """
        Execute a participant simulation

        Args:
            profile: Participant profile dict
            questions: List of question dicts

        Returns:
            Dict with:
                - responses: Dict of question_id to response data
                - cost: Total cost in USD
                - prompt_tokens: Input token count
                - completion_tokens: Output token count
                - total_tokens: Total token count

        Raises:
            Exception: If API call fails
            ValueError: If response parsing fails
        """
        # Build prompt
        prompt = self._build_prompt(profile, questions)

        # Extract question IDs
        question_ids = [q.get("question_id") for q in questions]

        try:
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a realistic participant simulator for psychology research. Respond in character based on the given profile.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens,
            )

            # Extract response content
            raw_response = response.choices[0].message.content

            # Parse response
            responses = self._parse_response(raw_response, question_ids)

            # Extract token usage
            prompt_tokens = response.usage.prompt_tokens
            completion_tokens = response.usage.completion_tokens
            total_tokens = response.usage.total_tokens

            # Calculate cost
            cost = self._calculate_cost(prompt_tokens, completion_tokens)

            return {
                "responses": responses,
                "cost": cost,
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": total_tokens,
            }

        except ValueError:
            # Re-raise ValueError as-is for response parsing errors
            raise
        except Exception as e:
            raise Exception(f"LLM execution failed: {str(e)}")
