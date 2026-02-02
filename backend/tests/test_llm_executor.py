"""
Tests for LLM Executor Service
"""
import pytest
from unittest.mock import Mock, patch

from app.services.llm_executor import LLMExecutor


class TestBuildPrompt:
    """Tests for _build_prompt method"""

    def test_build_prompt_with_minimal_profile(self):
        """Test building prompt with minimal participant profile"""
        executor = LLMExecutor(api_key="test-key")

        profile = {
            "participant_number": 1,
            "age": 30,
            "gender": "female",
            "country": "United States",
            "education": "bachelor",
            "language": "English",
            "life_stage": "adult"
        }

        questions = [
            {
                "question_id": "q1",
                "question_text": "On a scale of 1-10, how stressed do you feel?",
                "question_type": "likert_scale",
                "options": {"min": 1, "max": 10}
            }
        ]

        prompt = executor._build_prompt(profile, questions)

        # Verify prompt contains key elements
        assert "You are simulating Participant #1" in prompt
        assert "30 years old" in prompt
        assert "female" in prompt
        assert "United States" in prompt
        assert "bachelor" in prompt
        assert "English" in prompt
        assert "On a scale of 1-10, how stressed do you feel?" in prompt
        assert "q1" in prompt

    def test_build_prompt_with_full_profile(self):
        """Test building prompt with complete participant profile"""
        executor = LLMExecutor(api_key="test-key")

        profile = {
            "participant_number": 42,
            "age": 55,
            "gender": "male",
            "country": "Germany",
            "education": "master",
            "language": "German",
            "life_stage": "middle_aged"
        }

        questions = [
            {
                "question_id": "satisfaction",
                "question_text": "How satisfied are you with your work-life balance?",
                "question_type": "likert_scale",
                "options": {"min": 1, "max": 5, "labels": ["Very dissatisfied", "Very satisfied"]}
            },
            {
                "question_id": "factors",
                "question_text": "What factors contribute most to your stress?",
                "question_type": "open_ended",
                "options": {}
            }
        ]

        prompt = executor._build_prompt(profile, questions)

        # Verify all profile elements are included
        assert "42" in prompt
        assert "55 years old" in prompt
        assert "male" in prompt
        assert "Germany" in prompt
        assert "master" in prompt
        assert "German" in prompt
        assert "middle_aged" in prompt

        # Verify all questions are included
        assert "satisfaction" in prompt
        assert "How satisfied are you with your work-life balance?" in prompt
        assert "factors" in prompt
        assert "What factors contribute most to your stress?" in prompt

    def test_build_prompt_includes_instructions(self):
        """Test that prompt includes clear instructions for response format"""
        executor = LLMExecutor(api_key="test-key")

        profile = {
            "participant_number": 1,
            "age": 25,
            "gender": "non_binary",
            "country": "Canada",
            "education": "some_college",
            "language": "English",
            "life_stage": "young_adult"
        }

        questions = [
            {
                "question_id": "q1",
                "question_text": "Test question",
                "question_type": "multiple_choice",
                "options": {"choices": ["A", "B", "C"]}
            }
        ]

        prompt = executor._build_prompt(profile, questions)

        # Verify instructions are present
        assert "Respond in character" in prompt
        assert "JSON format" in prompt.lower() or "json" in prompt.lower()

    def test_build_prompt_handles_question_types(self):
        """Test that prompt handles different question types appropriately"""
        executor = LLMExecutor(api_key="test-key")

        profile = {
            "participant_number": 1,
            "age": 35,
            "gender": "female",
            "country": "United Kingdom",
            "education": "doctorate",
            "language": "English",
            "life_stage": "adult"
        }

        questions = [
            {
                "question_id": "q_mc",
                "question_text": "Choose your preferred option",
                "question_type": "multiple_choice",
                "options": {"choices": ["Option A", "Option B", "Option C"]}
            },
            {
                "question_id": "q_likert",
                "question_text": "Rate your agreement",
                "question_type": "likert_scale",
                "options": {"min": 1, "max": 7}
            },
            {
                "question_id": "q_open",
                "question_text": "Describe your experience",
                "question_type": "open_ended",
                "options": {}
            }
        ]

        prompt = executor._build_prompt(profile, questions)

        # Verify all question types are represented
        assert "q_mc" in prompt
        assert "q_likert" in prompt
        assert "q_open" in prompt
        assert "Choose your preferred option" in prompt
        assert "Rate your agreement" in prompt
        assert "Describe your experience" in prompt


class TestParseResponse:
    """Tests for _parse_response method"""

    def test_parse_valid_json_response(self):
        """Test parsing valid JSON response"""
        executor = LLMExecutor(api_key="test-key")

        raw_response = '''```json
{
    "q1": {
        "response": "7",
        "confidence": "high"
    },
    "q2": {
        "response": "I feel quite satisfied with my current situation.",
        "confidence": "medium"
    }
}
```'''

        result = executor._parse_response(raw_response, ["q1", "q2"])

        assert len(result) == 2
        assert "q1" in result
        assert result["q1"]["response"] == "7"
        assert result["q1"]["confidence"] == "high"
        assert "q2" in result
        assert "I feel quite satisfied with my current situation." in result["q2"]["response"]

    def test_parse_json_without_markdown(self):
        """Test parsing JSON without markdown code blocks"""
        executor = LLMExecutor(api_key="test-key")

        raw_response = '''{
    "q1": {"response": "Option A", "confidence": "high"},
    "q2": {"response": "5", "confidence": "high"}
}'''

        result = executor._parse_response(raw_response, ["q1", "q2"])

        assert len(result) == 2
        assert result["q1"]["response"] == "Option A"
        assert result["q2"]["response"] == "5"

    def test_parse_response_with_missing_question(self):
        """Test parsing response when some questions are missing"""
        executor = LLMExecutor(api_key="test-key")

        raw_response = '''{
    "q1": {"response": "Option B", "confidence": "high"}
}'''

        result = executor._parse_response(raw_response, ["q1", "q2", "q3"])

        # Should only return q1, q2 and q3 should be omitted
        assert len(result) == 1
        assert "q1" in result
        assert "q2" not in result
        assert "q3" not in result

    def test_parse_malformed_json_raises_error(self):
        """Test that malformed JSON raises appropriate error"""
        executor = LLMExecutor(api_key="test-key")

        raw_response = '''This is not valid JSON at all.
The LLM failed to provide structured output.'''

        with pytest.raises(ValueError) as exc_info:
            executor._parse_response(raw_response, ["q1", "q2"])

        assert "Failed to parse LLM response" in str(exc_info.value)

    def test_parse_empty_response(self):
        """Test parsing empty response"""
        executor = LLMExecutor(api_key="test-key")

        raw_response = ""

        with pytest.raises(ValueError) as exc_info:
            executor._parse_response(raw_response, ["q1"])

        assert "Failed to parse LLM response" in str(exc_info.value)

    def test_parse_response_with_extra_fields(self):
        """Test that extra fields in response are preserved"""
        executor = LLMExecutor(api_key="test-key")

        raw_response = '''{
    "q1": {
        "response": "8",
        "confidence": "high",
        "reasoning": "I chose this because...",
        "time_taken": "5 seconds"
    }
}'''

        result = executor._parse_response(raw_response, ["q1"])

        assert len(result) == 1
        assert result["q1"]["response"] == "8"
        assert result["q1"]["confidence"] == "high"
        assert result["q1"]["reasoning"] == "I chose this because..."
        assert result["q1"]["time_taken"] == "5 seconds"


class TestCalculateCost:
    """Tests for _calculate_cost method"""

    def test_calculate_cost_with_gpt4o(self):
        """Test cost calculation for GPT-4o"""
        executor = LLMExecutor(api_key="test-key", model="gpt-4o")

        # GPT-4o: ~$0.005 per 1K tokens (both input and output)
        prompt_tokens = 1000
        completion_tokens = 500

        cost = executor._calculate_cost(prompt_tokens, completion_tokens)

        expected_cost = (1000 + 500) * 0.005 / 1000
        assert abs(cost - expected_cost) < 0.0001

    def test_calculate_cost_custom_pricing(self):
        """Test cost calculation with custom pricing"""
        executor = LLMExecutor(
            api_key="test-key",
            model="custom-model",
            input_cost_per_1k=0.01,
            output_cost_per_1k=0.02
        )

        prompt_tokens = 2000
        completion_tokens = 1000

        cost = executor._calculate_cost(prompt_tokens, completion_tokens)

        expected_cost = (2000 * 0.01 / 1000) + (1000 * 0.02 / 1000)
        assert abs(cost - expected_cost) < 0.0001


class TestExecuteParticipant:
    """Tests for execute_participant method"""

    @patch('app.services.llm_executor.OpenAI')
    def test_execute_participant_success(self, mock_openai):
        """Test successful participant execution"""
        # Mock OpenAI client
        mock_client = Mock()
        mock_openai.return_value = mock_client

        mock_response = Mock()
        mock_response.choices = [Mock(message=Mock(content='{"q1": {"response": "7"}}'))]
        mock_response.usage = Mock(prompt_tokens=500, completion_tokens=100, total_tokens=600)
        mock_client.chat.completions.create.return_value = mock_response

        executor = LLMExecutor(api_key="test-key")

        profile = {
            "participant_number": 1,
            "age": 30,
            "gender": "female",
            "country": "United States",
            "education": "bachelor",
            "language": "English",
            "life_stage": "adult"
        }

        questions = [
            {
                "question_id": "q1",
                "question_text": "Rate your stress",
                "question_type": "likert_scale",
                "options": {"min": 1, "max": 10}
            }
        ]

        result = executor.execute_participant(profile, questions)

        # Verify result structure
        assert "responses" in result
        assert "cost" in result
        assert "prompt_tokens" in result
        assert "completion_tokens" in result
        assert "total_tokens" in result

        # Verify responses
        assert "q1" in result["responses"]
        assert result["responses"]["q1"]["response"] == "7"

        # Verify token counts
        assert result["prompt_tokens"] == 500
        assert result["completion_tokens"] == 100
        assert result["total_tokens"] == 600

        # Verify cost calculation
        assert result["cost"] > 0

    @patch('app.services.llm_executor.OpenAI')
    def test_execute_participant_with_custom_parameters(self, mock_openai):
        """Test execution with custom model parameters"""
        mock_client = Mock()
        mock_openai.return_value = mock_client

        mock_response = Mock()
        mock_response.choices = [Mock(message=Mock(content='{"q1": {"response": "Yes"}}'))]
        mock_response.usage = Mock(prompt_tokens=300, completion_tokens=50, total_tokens=350)
        mock_client.chat.completions.create.return_value = mock_response

        executor = LLMExecutor(
            api_key="test-key",
            model="gpt-4o",
            temperature=0.9,
            max_tokens=500
        )

        profile = {
            "participant_number": 1,
            "age": 25,
            "gender": "male",
            "country": "Canada",
            "education": "high_school",
            "language": "English",
            "life_stage": "young_adult"
        }

        questions = [
            {
                "question_id": "q1",
                "question_text": "Do you agree?",
                "question_type": "yes_no",
                "options": {}
            }
        ]

        result = executor.execute_participant(profile, questions)

        # Verify OpenAI was called with correct parameters
        mock_client.chat.completions.create.assert_called_once()
        call_args = mock_client.chat.completions.create.call_args

        assert call_args.kwargs["model"] == "gpt-4o"
        assert call_args.kwargs["temperature"] == 0.9
        assert call_args.kwargs["max_tokens"] == 500

        # Verify result
        assert "q1" in result["responses"]
        assert result["responses"]["q1"]["response"] == "Yes"

    @patch('app.services.llm_executor.OpenAI')
    def test_execute_participant_api_error(self, mock_openai):
        """Test handling of OpenAI API errors"""
        mock_client = Mock()
        mock_openai.return_value = mock_client

        # Simulate API error
        mock_client.chat.completions.create.side_effect = Exception("API Error: Rate limit exceeded")

        executor = LLMExecutor(api_key="test-key")

        profile = {
            "participant_number": 1,
            "age": 30,
            "gender": "female",
            "country": "United States",
            "education": "bachelor",
            "language": "English",
            "life_stage": "adult"
        }

        questions = [
            {
                "question_id": "q1",
                "question_text": "Test question",
                "question_type": "open_ended",
                "options": {}
            }
        ]

        with pytest.raises(Exception) as exc_info:
            executor.execute_participant(profile, questions)

        assert "API Error" in str(exc_info.value)

    @patch('app.services.llm_executor.OpenAI')
    def test_execute_participant_invalid_json_response(self, mock_openai):
        """Test handling of invalid JSON in LLM response"""
        mock_client = Mock()
        mock_openai.return_value = mock_client

        # LLM returns invalid JSON
        mock_response = Mock()
        mock_response.choices = [Mock(message=Mock(content='This is not JSON'))]
        mock_response.usage = Mock(prompt_tokens=300, completion_tokens=50)
        mock_client.chat.completions.create.return_value = mock_response

        executor = LLMExecutor(api_key="test-key")

        profile = {
            "participant_number": 1,
            "age": 30,
            "gender": "female",
            "country": "United States",
            "education": "bachelor",
            "language": "English",
            "life_stage": "adult"
        }

        questions = [
            {
                "question_id": "q1",
                "question_text": "Test question",
                "question_type": "open_ended",
                "options": {}
            }
        ]

        with pytest.raises(ValueError) as exc_info:
            executor.execute_participant(profile, questions)

        assert "Failed to parse LLM response" in str(exc_info.value)


class TestLLMExecutorInitialization:
    """Tests for LLMExecutor initialization"""

    def test_default_initialization(self):
        """Test executor with default parameters"""
        executor = LLMExecutor(api_key="test-key")

        assert executor.api_key == "test-key"
        assert executor.model == "gpt-4o"
        assert executor.temperature == 0.8
        assert executor.max_tokens == 2000

    def test_custom_initialization(self):
        """Test executor with custom parameters"""
        executor = LLMExecutor(
            api_key="custom-key",
            model="gpt-4-turbo",
            temperature=0.5,
            max_tokens=1000,
            input_cost_per_1k=0.01,
            output_cost_per_1k=0.03
        )

        assert executor.api_key == "custom-key"
        assert executor.model == "gpt-4-turbo"
        assert executor.temperature == 0.5
        assert executor.max_tokens == 1000
        assert executor.input_cost_per_1k == 0.01
        assert executor.output_cost_per_1k == 0.03
