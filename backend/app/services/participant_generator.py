"""
Participant Profile Generator Service
"""
import random
from typing import Literal


class ParticipantGenerator:
    """
    Generate synthetic participant profiles with configurable demographics
    """

    # Default demographics configuration
    DEFAULT_GENDERS = ["male", "female", "non_binary", "prefer_not_to_say"]
    DEFAULT_GENDER_WEIGHTS = [0.49, 0.49, 0.01, 0.01]

    DEFAULT_COUNTRIES = [
        "United States",
        "United Kingdom",
        "Canada",
        "Australia",
        "Germany",
        "France",
        "India",
        "Philippines",
    ]

    COUNTRY_LANGUAGE_MAP = {
        "United States": "English",
        "United Kingdom": "English",
        "Canada": "English",
        "Australia": "English",
        "Germany": "German",
        "France": "French",
        "India": "Hindi",
        "Philippines": "English",
    }

    EDUCATION_LEVELS = [
        "less_than_high_school",
        "high_school",
        "some_college",
        "bachelor",
        "master",
        "doctorate",
        "professional",
    ]

    LIFE_STAGES = ["young_adult", "adult", "middle_aged", "senior"]

    def __init__(
        self,
        age_min: int = 18,
        age_max: int = 100,
        genders: list[str] | None = None,
        gender_weights: list[float] | None = None,
        countries: list[str] | None = None,
        education_levels: list[str] | None = None,
    ):
        """
        Initialize the participant generator with demographic constraints

        Args:
            age_min: Minimum age (default: 18)
            age_max: Maximum age (default: 100)
            genders: List of gender options (default: all)
            gender_weights: Weights for gender distribution (default: balanced)
            countries: List of countries to sample from (default: all)
            education_levels: List of education levels (default: all)
        """
        self.age_min = age_min
        self.age_max = age_max
        self.genders = genders or self.DEFAULT_GENDERS
        self.gender_weights = gender_weights or self.DEFAULT_GENDER_WEIGHTS
        self.countries = countries or self.DEFAULT_COUNTRIES
        self.education_levels = education_levels or self.EDUCATION_LEVELS

    def generate(self, count: int = 1) -> list[dict]:
        """
        Generate synthetic participant profiles

        Args:
            count: Number of profiles to generate

        Returns:
            List of participant profile dictionaries
        """
        profiles = []

        for i in range(count):
            profile = self._generate_profile(participant_number=i + 1)
            profiles.append(profile)

        return profiles

    def _generate_profile(self, participant_number: int) -> dict:
        """
        Generate a single participant profile

        Args:
            participant_number: Sequential participant number

        Returns:
            Dictionary with participant profile data
        """
        # Generate age
        age = random.randint(self.age_min, self.age_max)

        # Generate gender with weights
        gender = random.choices(self.genders, weights=self.gender_weights, k=1)[0]

        # Generate country
        country = random.choice(self.countries)

        # Generate education (age-appropriate)
        education = self._generate_education(age)

        # Infer language from country
        language = self.COUNTRY_LANGUAGE_MAP.get(country, "English")

        # Infer life stage from age
        life_stage = self._infer_life_stage(age)

        return {
            "participant_number": participant_number,
            "age": age,
            "gender": gender,
            "country": country,
            "education": education,
            "language": language,
            "life_stage": life_stage,
        }

    def _generate_education(self, age: int) -> str:
        """
        Generate age-appropriate education level

        Args:
            age: Participant age

        Returns:
            Education level string
        """
        # Filter education levels based on age
        appropriate_education = [
            edu for edu in self.education_levels if self._is_education_age_appropriate(edu, age)
        ]

        if not appropriate_education:
            # Fallback to high school if nothing is appropriate
            return "high_school"

        return random.choice(appropriate_education)

    def _is_education_age_appropriate(self, education: str, age: int) -> bool:
        """
        Check if education level is age-appropriate

        Args:
            education: Education level
            age: Participant age

        Returns:
            True if education is appropriate for age
        """
        # Age constraints for education levels
        # Assume: high school at 18, bachelor at 22, master at 24, doctorate/professional at 26
        if education == "doctorate" or education == "professional":
            return age >= 26
        elif education == "master":
            return age >= 24
        elif education == "bachelor":
            return age >= 22
        elif education == "some_college":
            return age >= 19
        else:
            # less_than_high_school and high_school are always appropriate
            return True

    def _infer_life_stage(self, age: int) -> str:
        """
        Infer life stage from age

        Args:
            age: Participant age

        Returns:
            Life stage string
        """
        if age < 25:
            return "young_adult"
        elif age < 40:
            return "adult"
        elif age < 60:
            return "middle_aged"
        else:
            return "senior"
