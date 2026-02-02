"""
Statistical analysis service for experiment results
"""
from collections import Counter
from typing import Any

import numpy as np
from sqlalchemy.orm import Session

from app.models.response import Response as ResponseModel


class Analyzer:
    """
    Statistical analysis service for experiment results

    Provides methods for:
    - Descriptive statistics (mean, median, std, min, max, quartiles)
    - Frequency tables for categorical data
    - Data grouping by question
    - Automatic numeric vs categorical detection
    """

    @staticmethod
    def descriptive_statistics(data: list[Any]) -> dict[str, Any]:
        """
        Calculate descriptive statistics for numeric data

        Args:
            data: List of numeric values

        Returns:
            Dictionary with count, mean, median, std, min, max, q25, q75
            Returns None values for empty data
        """
        if not data:
            return {
                "count": 0,
                "mean": None,
                "median": None,
                "std": None,
                "min": None,
                "max": None,
                "q25": None,
                "q75": None,
            }

        # Convert to numpy array for calculations
        values = np.array(data, dtype=float)

        return {
            "count": len(data),
            "mean": float(np.mean(values)),
            "median": float(np.median(values)),
            "std": float(np.std(values, ddof=1)) if len(data) > 1 else 0.0,
            "min": float(np.min(values)),
            "max": float(np.max(values)),
            "q25": float(np.percentile(values, 25)),
            "q75": float(np.percentile(values, 75)),
        }

    @staticmethod
    def frequency_table(data: list[Any]) -> dict[Any, dict[str, Any]]:
        """
        Generate frequency table for categorical data

        Args:
            data: List of categorical values

        Returns:
            Dictionary mapping each unique value to its count and percentage
        """
        if not data:
            return {}

        total = len(data)
        counts = Counter(data)

        return {
            value: {
                "count": count,
                "percentage": round((count / total) * 100, 2),
            }
            for value, count in counts.items()
        }

    @staticmethod
    def _detect_data_type(data: list[Any]) -> str:
        """
        Detect if data is numeric or categorical

        Args:
            data: List of values

        Returns:
            "numeric" or "categorical"
        """
        if not data:
            return "numeric"

        # Try to convert all values to numeric
        try:
            numeric_data = [float(x) for x in data]
            unique_count = len(set(numeric_data))

            # If we have very few unique values relative to total, treat as categorical
            # Heuristic: less than 5 unique values AND less than 50% of data are unique
            # This allows [1,2,3,4,5] to be numeric but [1,1,2,2,1,2] to be categorical
            if unique_count < 5 and unique_count < len(data) * 0.5:
                return "categorical"

            return "numeric"
        except (ValueError, TypeError):
            # If conversion fails, data is categorical
            return "categorical"

    @staticmethod
    def summarize_experiment(
        db: Session, experiment_id: int
    ) -> dict[str, Any]:
        """
        Generate comprehensive analysis for an experiment

        Args:
            db: Database session
            experiment_id: Experiment ID to analyze

        Returns:
            Dictionary with experiment summary including:
            - experiment_id
            - questions: dict mapping question_id to analysis results
              Each question has:
              - type: "numeric" or "categorical"
              - descriptive: descriptive statistics (if numeric)
              - frequency: frequency table (if categorical)

        Raises:
            ValueError: If experiment not found
        """
        from app.models.experiment import Experiment as ExperimentModel

        # Verify experiment exists
        experiment = (
            db.query(ExperimentModel)
            .filter(ExperimentModel.id == experiment_id)
            .first()
        )

        if not experiment:
            raise ValueError("Experiment not found")

        # Get all responses for this experiment
        responses = (
            db.query(ResponseModel)
            .filter(ResponseModel.experiment_id == experiment_id)
            .all()
        )

        # Group responses by question
        questions_data: dict[str, list[Any]] = {}
        for response in responses:
            question_id = response.question_id

            # Extract value from coded_response if available
            if response.coded_response and "value" in response.coded_response:
                value = response.coded_response["value"]
            else:
                # Fallback to raw_response
                value = response.raw_response

            if question_id not in questions_data:
                questions_data[question_id] = []
            questions_data[question_id].append(value)

        # Analyze each question
        questions_analysis: dict[str, dict[str, Any]] = {}
        for question_id, values in questions_data.items():
            data_type = Analyzer._detect_data_type(values)

            analysis: dict[str, Any] = {"type": data_type}

            if data_type == "numeric":
                analysis["descriptive"] = Analyzer.descriptive_statistics(values)
            else:
                analysis["frequency"] = Analyzer.frequency_table(values)

            questions_analysis[question_id] = analysis

        return {
            "experiment_id": experiment_id,
            "questions": questions_analysis,
        }
