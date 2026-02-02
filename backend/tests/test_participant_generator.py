"""
Tests for Participant Profile Generator
"""
import pytest

from app.services.participant_generator import ParticipantGenerator


class TestSingleProfileGeneration:
    """Tests for generating a single participant profile"""

    def test_generate_single_profile(self):
        """Test generating a single participant profile with default demographics"""
        generator = ParticipantGenerator()
        profiles = generator.generate(count=1)

        assert len(profiles) == 1
        profile = profiles[0]

        # Check required fields exist
        assert "participant_number" in profile
        assert "age" in profile
        assert "gender" in profile
        assert "country" in profile
        assert "education" in profile
        assert "language" in profile
        assert "life_stage" in profile

        # Check participant number
        assert profile["participant_number"] == 1

        # Check age is in reasonable range
        assert isinstance(profile["age"], int)
        assert 18 <= profile["age"] <= 100

        # Check gender is valid
        assert profile["gender"] in ["male", "female", "non_binary", "prefer_not_to_say"]

        # Check country is not empty
        assert isinstance(profile["country"], str)
        assert len(profile["country"]) > 0

        # Check education is valid
        assert profile["education"] in [
            "less_than_high_school",
            "high_school",
            "some_college",
            "bachelor",
            "master",
            "doctorate",
            "professional",
        ]

        # Check language is inferred
        assert isinstance(profile["language"], str)
        assert len(profile["language"]) > 0

        # Check life_stage is valid
        assert profile["life_stage"] in [
            "young_adult",
            "adult",
            "middle_aged",
            "senior",
        ]


class TestMultipleProfileGeneration:
    """Tests for generating multiple participant profiles"""

    def test_generate_multiple_profiles(self):
        """Test generating multiple participant profiles"""
        generator = ParticipantGenerator()
        count = 10
        profiles = generator.generate(count=count)

        # Check correct number of profiles
        assert len(profiles) == count

        # Check participant numbers are sequential
        for i, profile in enumerate(profiles):
            assert profile["participant_number"] == i + 1

        # Check all profiles have required fields
        for profile in profiles:
            assert "participant_number" in profile
            assert "age" in profile
            assert "gender" in profile
            assert "country" in profile
            assert "education" in profile
            assert "language" in profile
            assert "life_stage" in profile

    def test_generate_large_batch(self):
        """Test generating a large batch of profiles"""
        generator = ParticipantGenerator()
        count = 100
        profiles = generator.generate(count=count)

        assert len(profiles) == count
        assert len(set(p["participant_number"] for p in profiles)) == count


class TestDemographicConstraints:
    """Tests for demographic constraints and filters"""

    def test_age_range_constraint(self):
        """Test that age range constraints are respected"""
        age_min, age_max = 25, 35
        generator = ParticipantGenerator(age_min=age_min, age_max=age_max)
        profiles = generator.generate(count=50)

        for profile in profiles:
            assert age_min <= profile["age"] <= age_max

    def test_age_appropriate_education(self):
        """Test that education is age-appropriate"""
        generator = ParticipantGenerator()
        profiles = generator.generate(count=100)

        for profile in profiles:
            age = profile["age"]
            education = profile["education"]

            # No PhD or professional degree before age 26
            if age < 26:
                assert education not in ["doctorate", "professional"]

            # No master's before age 24
            if age < 24:
                assert education not in ["master", "doctorate", "professional"]

            # No bachelor's before age 22
            if age < 22:
                assert education not in ["bachelor", "master", "doctorate", "professional"]

    def test_specific_countries_filter(self):
        """Test filtering by specific countries"""
        specific_countries = ["United States", "Canada", "United Kingdom"]
        generator = ParticipantGenerator(countries=specific_countries)
        profiles = generator.generate(count=50)

        for profile in profiles:
            assert profile["country"] in specific_countries

        # Check that all specified countries appear
        countries_found = set(p["country"] for p in profiles)
        assert len(countries_found.intersection(specific_countries)) > 0

    def test_specific_education_levels(self):
        """Test filtering by specific education levels"""
        specific_education = ["high_school", "bachelor", "master"]
        generator = ParticipantGenerator(education_levels=specific_education)
        profiles = generator.generate(count=50)

        for profile in profiles:
            assert profile["education"] in specific_education


class TestGenderDistribution:
    """Tests for gender distribution"""

    def test_default_gender_distribution(self):
        """Test that default gender distribution is roughly balanced"""
        generator = ParticipantGenerator()
        profiles = generator.generate(count=1000)

        # Count genders
        gender_counts = {}
        for profile in profiles:
            gender = profile["gender"]
            gender_counts[gender] = gender_counts.get(gender, 0) + 1

        # Check that male and female are roughly equal (within 10%)
        male_pct = gender_counts["male"] / len(profiles)
        female_pct = gender_counts["female"] / len(profiles)

        assert 0.44 < male_pct < 0.54  # Expected ~0.49
        assert 0.44 < female_pct < 0.54  # Expected ~0.49

    def test_custom_gender_weights(self):
        """Test custom gender weights"""
        # Skewed distribution: 70% male, 30% female
        custom_genders = ["male", "female"]
        custom_weights = [0.7, 0.3]

        generator = ParticipantGenerator(
            genders=custom_genders, gender_weights=custom_weights
        )
        profiles = generator.generate(count=500)

        # Count genders
        gender_counts = {}
        for profile in profiles:
            gender = profile["gender"]
            gender_counts[gender] = gender_counts.get(gender, 0) + 1

        male_pct = gender_counts["male"] / len(profiles)
        female_pct = gender_counts["female"] / len(profiles)

        # Check distribution is roughly correct (within 10%)
        assert 0.60 < male_pct < 0.80  # Expected 0.70
        assert 0.20 < female_pct < 0.40  # Expected 0.30


class TestLanguageAndLifeStage:
    """Tests for inferred fields"""

    def test_language_inferred_from_country(self):
        """Test that language is correctly inferred from country"""
        generator = ParticipantGenerator()

        # Test specific country-language mappings
        test_cases = [
            ("United States", "English"),
            ("United Kingdom", "English"),
            ("Germany", "German"),
            ("France", "French"),
        ]

        for country, expected_language in test_cases:
            # Force the country by setting it as the only option
            generator = ParticipantGenerator(countries=[country])
            profiles = generator.generate(count=10)

            for profile in profiles:
                assert profile["language"] == expected_language
                assert profile["country"] == country

    def test_life_stage_inferred_from_age(self):
        """Test that life stage is correctly inferred from age"""
        generator = ParticipantGenerator()

        # Test specific age ranges and expected life stages
        test_cases = [
            (18, "young_adult"),
            (20, "young_adult"),
            (25, "adult"),
            (30, "adult"),
            (45, "middle_aged"),
            (55, "middle_aged"),
            (65, "senior"),
            (80, "senior"),
        ]

        for test_age, expected_life_stage in test_cases:
            # Force the age by setting narrow range
            generator = ParticipantGenerator(age_min=test_age, age_max=test_age)
            profiles = generator.generate(count=5)

            for profile in profiles:
                assert profile["age"] == test_age
                assert profile["life_stage"] == expected_life_stage
