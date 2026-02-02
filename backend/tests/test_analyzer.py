"""
Tests for the Analyzer service
"""
import pytest
from app.services.analyzer import Analyzer


class TestDescriptiveStatistics:
    """Test descriptive_statistics method"""

    def test_descriptive_statistics_with_numeric_data(self):
        """Test descriptive statistics with numeric data"""
        data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        result = Analyzer.descriptive_statistics(data)

        assert result["count"] == 10
        assert result["mean"] == 5.5
        assert result["median"] == 5.5
        assert result["min"] == 1
        assert result["max"] == 10
        assert result["q25"] == 3.25
        assert result["q75"] == 7.75
        assert "std" in result

    def test_descriptive_statistics_with_single_value(self):
        """Test descriptive statistics with single value"""
        data = [5]
        result = Analyzer.descriptive_statistics(data)

        assert result["count"] == 1
        assert result["mean"] == 5
        assert result["median"] == 5
        assert result["min"] == 5
        assert result["max"] == 5
        assert result["q25"] == 5
        assert result["q75"] == 5

    def test_descriptive_statistics_with_empty_list(self):
        """Test descriptive statistics with empty list"""
        data = []
        result = Analyzer.descriptive_statistics(data)

        assert result["count"] == 0
        assert result["mean"] is None
        assert result["median"] is None
        assert result["min"] is None
        assert result["max"] is None
        assert result["q25"] is None
        assert result["q75"] is None
        assert result["std"] is None

    def test_descriptive_statistics_with_duplicates(self):
        """Test descriptive statistics with duplicate values"""
        data = [5, 5, 5, 5, 5]
        result = Analyzer.descriptive_statistics(data)

        assert result["count"] == 5
        assert result["mean"] == 5
        assert result["median"] == 5
        assert result["std"] == 0


class TestFrequencyTable:
    """Test frequency_table method"""

    def test_frequency_table_with_strings(self):
        """Test frequency table with string data"""
        data = ["red", "blue", "red", "green", "blue", "red"]
        result = Analyzer.frequency_table(data)

        assert len(result) == 3
        assert result["red"]["count"] == 3
        assert result["red"]["percentage"] == 50.0
        assert result["blue"]["count"] == 2
        assert result["blue"]["percentage"] == pytest.approx(33.33, rel=0.01)
        assert result["green"]["count"] == 1
        assert result["green"]["percentage"] == pytest.approx(16.67, rel=0.01)

    def test_frequency_table_with_numbers(self):
        """Test frequency table with numeric data"""
        data = [1, 2, 2, 3, 3, 3]
        result = Analyzer.frequency_table(data)

        assert len(result) == 3
        assert result[1]["count"] == 1
        assert result[1]["percentage"] == pytest.approx(16.67, rel=0.01)
        assert result[2]["count"] == 2
        assert result[2]["percentage"] == pytest.approx(33.33, rel=0.01)
        assert result[3]["count"] == 3
        assert result[3]["percentage"] == 50.0

    def test_frequency_table_with_empty_list(self):
        """Test frequency table with empty list"""
        data = []
        result = Analyzer.frequency_table(data)

        assert result == {}

    def test_frequency_table_with_single_value(self):
        """Test frequency table with single value"""
        data = ["only"]
        result = Analyzer.frequency_table(data)

        assert len(result) == 1
        assert result["only"]["count"] == 1
        assert result["only"]["percentage"] == 100.0


class TestSummarizeExperiment:
    """Test summarize_experiment method"""

    def test_summarize_experiment_with_mixed_data(self, db_session):
        """Test summarizing experiment with mixed numeric and categorical data"""
        from app.models import Experiment, Participant, Response

        # Create experiment
        experiment = Experiment(
            name="Test Experiment",
            description="Testing analysis",
            status="completed",
        )
        db_session.add(experiment)
        db_session.commit()

        # Create participants
        participant1 = Participant(
            experiment_id=experiment.id, participant_number=1
        )
        participant2 = Participant(
            experiment_id=experiment.id, participant_number=2
        )
        db_session.add(participant1)
        db_session.add(participant2)
        db_session.commit()

        # Add numeric responses
        for participant in [participant1, participant2]:
            response = Response(
                experiment_id=experiment.id,
                participant_id=participant.id,
                question_id="age",
                raw_response="25",
                coded_response={"value": 25},
            )
            db_session.add(response)

        # Add categorical responses
        for participant in [participant1, participant2]:
            response = Response(
                experiment_id=experiment.id,
                participant_id=participant.id,
                question_id="gender",
                raw_response="male",
                coded_response={"value": "male"},
            )
            db_session.add(response)

        db_session.commit()

        # Analyze
        result = Analyzer.summarize_experiment(db_session, experiment.id)

        # Check structure
        assert "experiment_id" in result
        assert "questions" in result
        assert len(result["questions"]) == 2

        # Check age question (numeric)
        age_stats = result["questions"]["age"]
        assert age_stats["type"] == "numeric"
        assert age_stats["descriptive"]["count"] == 2
        assert age_stats["descriptive"]["mean"] == 25.0

        # Check gender question (categorical)
        gender_stats = result["questions"]["gender"]
        assert gender_stats["type"] == "categorical"
        assert "male" in gender_stats["frequency"]
        assert gender_stats["frequency"]["male"]["count"] == 2

    def test_summarize_experiment_with_no_responses(self, db_session):
        """Test summarizing experiment with no responses"""
        from app.models import Experiment

        experiment = Experiment(
            name="Empty Experiment",
            description="No responses",
            status="completed",
        )
        db_session.add(experiment)
        db_session.commit()

        result = Analyzer.summarize_experiment(db_session, experiment.id)

        assert result["experiment_id"] == experiment.id
        assert result["questions"] == {}

    def test_summarize_nonexistent_experiment(self, db_session):
        """Test summarizing non-existent experiment"""
        with pytest.raises(ValueError, match="Experiment not found"):
            Analyzer.summarize_experiment(db_session, 99999)


class TestDetectDataType:
    """Test _detect_data_type method"""

    def test_detect_numeric_data(self):
        """Test detection of numeric data"""
        data = [1, 2, 3, 4, 5]
        assert Analyzer._detect_data_type(data) == "numeric"

    def test_detect_categorical_string_data(self):
        """Test detection of categorical string data"""
        data = ["a", "b", "c"]
        assert Analyzer._detect_data_type(data) == "categorical"

    def test_detect_categorical_numeric_with_few_unique_values(self):
        """Test detection of categorical data when numeric has few unique values"""
        data = [1, 1, 2, 2, 1, 2]
        assert Analyzer._detect_data_type(data) == "categorical"

    def test_detect_mixed_data_as_categorical(self):
        """Test that mixed data is treated as categorical"""
        data = [1, 2, "three", 4]
        assert Analyzer._detect_data_type(data) == "categorical"
