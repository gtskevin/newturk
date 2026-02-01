# Silicon Sample Simulator - Design Document

**Project**: LLM-based Synthetic Participant Platform for Psychology Research
**Date**: 2026-02-01
**Purpose**: Academic research tool for generating pilot data using LLM-simulated human samples

---

## Executive Summary

This application enables psychology researchers to quickly generate pilot data by simulating human participants with specified demographic characteristics using Large Language Models (LLMs). Researchers can design surveys, scenario experiments, and recall studies; execute them with synthetic participants matching target sample parameters; and analyze results with built-in statistical tools.

**Target Users**: Academic researchers conducting pilot studies, experiment design refinement, and preliminary statistical power analysis.

**Key Value Proposition**: Reduce time from experiment design to pilot data from weeks/months to hours, while enabling precise control over sample characteristics.

---

## System Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + TypeScript)           │
│  - Visual experiment builder                                │
│  - Real-time execution monitoring                            │
│  - Interactive visualizations                                │
│  - Export management                                         │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI + Python)                │
│  - Experiment orchestration                                  │
│  - LLM API management                                        │
│  - Participant profile generation                            │
│  - Statistical analysis engine                               │
└─────────────────────────────────────────────────────────────┘
                              ↓ SQL
┌─────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                     │
│  - Experiments & configurations                              │
│  - Participant profiles                                      │
│  - Response data                                             │
│  - Analysis results                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Sample Generation System

**Purpose**: Generate realistic synthetic participant profiles matching specified demographic parameters.

**Input Parameters**:
- Age: Range (min-max), target mean, standard deviation, or custom distribution
- Categorical variables: Gender ratios, country/region distributions, education levels, professional roles
- Correlation constraints: e.g., "age correlates 0.3 with education level"

**Generation Method**: Rejection sampling with multivariate constraints to create profiles that match target parameters while maintaining realistic demographic correlations.

**Profile Structure**:
- **Basic demographics**: Age, gender, location, education, occupation, income bracket
- **Contextual attributes**: Cultural background, language preferences, life stage markers
- **Psychographic traits** (optional): Personality proxies, value orientations
- **Experience bank**: Generated history of plausible experiences for recall experiments

**Quality Checks**:
- Internal consistency validation (age ↔ education ↔ career stage)
- Demographic plausibility (flags rare combinations)
- Distribution adherence (warns if sample deviates from targets)

---

### 2. Experiment Execution Engine

**Purpose**: Orchestrate LLM interactions using researcher-selected validation strategies.

**Prompt Construction Pipeline**:
1. Base prompt: Experiment instructions
2. Persona injection: Demographic profile context
3. Content: Survey/scenario/recall materials
4. Validation layer: Strategy-specific prompts

**Execution Strategies** (researcher-selected):

**Strategy A - Simple Persona** (Fastest, lowest cost):
```
"You are a {age}-year-old {gender} from {country} with {education}...
Please respond to the following survey as realistically as possible..."
```

**Strategy B - Chain-of-Thought with Recall** (Moderate cost, higher authenticity):
```
"First, recall relevant experiences from your life as a {demographics}...
Consider how those experiences shaped your perspective...
Now, respond to: {experiment content}"
```

**Strategy C - Multi-Agent** (Highest cost, best quality):
1. Agent 1 generates perspective based on demographics
2. Agent 2 critiques for authenticity
3. Agent 3 produces final response

**Strategy D - Validation-Focused** (Balanced):
Simple persona + consistency checks:
- Confidence self-rating (1-10)
- Random duplicate questions
- Flags low-confidence/inconsistent responses

**Execution Management**:
- Batch processing with rate-limit awareness
- Progressive execution (small batches, check results, adjust)
- Real-time monitoring and cost tracking
- Automatic retries with exponential backoff
- Partial recovery (resume from last completion)

---

### 3. Statistical Analysis Engine

**Purpose**: Provide publication-ready statistical analysis using Python ecosystem.

**Reliability Analysis**:
- **Cronbach's alpha**: Overall alpha with 95% CI
- **Item diagnostics**: Alpha if item deleted, item-total correlations
- **Scale validation**: Automatic detection of related items

**Descriptive Statistics**:
- Central tendency: Mean, median, mode, confidence intervals
- Dispersion: SD, variance, IQR, range
- Distribution: Skewness, kurtosis, normality tests (Shapiro-Wilk)
- Frequency tables with percentages
- Demographic breakdowns

**Inferential Statistics** (using pingouin/statsmodels):
- T-tests (independent, paired) with Cohen's d
- ANOVA (one-way, two-way) with Tukey HSD
- Correlation (Pearson, Spearman) with matrices
- Regression (linear, logistic) with diagnostics
- Non-parametric: Mann-Whitney U, Kruskal-Wallis, Wilcoxon

**Advanced Features**:
- Effect sizes: Cohen's d, eta², odds ratios
- Power analysis: Post-hoc calculations
- Assumption testing: Normality, homogeneity, multicollinearity
- Multiple comparison correction: Bonferroni, FDR

**Visualization** (seaborn + matplotlib):
- Distribution: Histograms, KDE, box plots, violin plots
- Comparison: Bar charts with error bars, grouped box plots
- Relationships: Scatter plots with regression, correlation heatmaps
- Reliability: Item-total correlation plots, alpha if item deleted
- Stratification: Faceted plots by demographics
- Publication-ready: APA-format styling

**Export Formats**:
- SPSS (.sav): Variable labels, value labels, missing values
- R (.rds): data.frames with metadata
- Stata (.dta): Full labeling
- CSV + JSON metadata
- Excel: Multiple sheets (data, codebook, reliability, analysis)

---

### 4. User Interface

**Dashboard**:
- Experiment list with status and quick actions
- Cost tracking across experiments
- Quick template access
- Activity feed

**Experiment Builder** (drag-and-drop):
1. **Sample Configuration**:
   - Age distribution controls (sliders/inputs)
   - Categorical variables (gender pie chart, country multiselect)
   - Correlation constraints builder
   - Sample size with power analysis preview

2. **Content Editor**:
   - Survey builder (Likert, multiple choice, open-ended)
   - Scenario composer (rich text vignettes)
   - Recall prompt designer
   - Branching logic for skip patterns

3. **Execution Settings**:
   - LLM provider selection
   - Validation strategy dropdown
   - Batch size and concurrency
   - Cost estimation preview

**Execution Monitor**:
- Real-time progress bar
- Live response feed
- Quality metrics (flags, consistency checks)
- Running cost counter

**Results & Analysis**:
- Sortable/filterable data table
- Analysis sidebar (choose tests, set parameters)
- Visualization gallery with exports
- Reliability report with item diagnostics
- Export center (multi-format with metadata)

---

### 5. Data Model

**Core Tables**:

**experiments**:
- Basic: id, name, description, status, timestamps
- sample_config (JSONB): Demographic parameters
- experiment_config (JSONB): Questions, scenarios, prompts
- execution_settings (JSONB): LLM provider, strategy, batch size
- metadata (JSONB): Notes, tags, references

**participants**:
- id, experiment_id, participant_number
- profile (JSONB): Full demographic and contextual profile
- validation_flags: Quality warnings

**responses**:
- id, experiment_id, participant_id, question_id
- raw_response: Full LLM output
- coded_response: Structured data (numeric/text)
- metadata (JSONB): Tokens, cost, model, timestamp, validation scores
- quality_flags: Consistency, confidence, outlier warnings

**analysis_results**:
- id, experiment_id, analysis_type
- result_data (JSONB): Statistics, p-values, effect sizes
- visualization_config (JSONB): Plot parameters
- created_at

**exports**:
- id, experiment_id, format, file_path
- metadata_included, exported_at

**Storage**:
- PostgreSQL for relational data with JSONB flexibility
- Optional: Separate schema per experiment for isolation
- Versioning: Experiment copies preserve history
- File exports: Local filesystem or S3-compatible storage

**Reproducibility**:
- Exports include complete experiment_config.json
- Random seed stored for exact sample reproduction
- LLM model versions recorded
- Full audit trail for all actions

---

### 6. Quality Assurance

**API Error Handling**:
- Retry with exponential backoff (rate limits, transient failures)
- Timeout management (configurable, default 60s)
- Fallback LLM providers
- Partial recovery (resume mid-experiment)
- Hard cost caps (stops execution if exceeded)

**Response Quality Checks**:
- Consistency validation: Duplicate questions with wording variations
- Confidence scoring: LLM self-rates (1-10), flags low scores
- Length validation: Warns on unusual response lengths
- Outlier detection: Statistical outlier flagging
- Pattern detection: Flags repetitive/formulaic responses

**Quality Dashboard**:
- Completion rate percentage
- Aggregate quality score metric
- Cost per valid response
- Demographic adherence comparison

**Researcher Review**:
- Flagged responses queue
- Bulk actions (remove, re-run, adjust prompts)
- Quality report for publication transparency

**Validation Features**:
- Prompt testing mode: Run N=5 before full execution
- Ground truth comparison: Validate against real datasets
- Inter-rater reliability: Compare patterns across LLMs
- Sensitivity analysis: Re-run with different seeds

**Security**:
- API key encryption (AES-256)
- Session-based keys (not permanent unless opted in)
- No PII storage policy
- Local deployment option

---

## Technical Stack

**Frontend**:
- React + TypeScript + Vite
- TailwindCSS for styling
- React Query for data fetching
- Recharts for visualizations
- React Flow for drag-and-drop builder

**Backend**:
- FastAPI + Python 3.11+
- Pydantic for validation
- Asyncpg for PostgreSQL async
- Celery for background tasks (optional)

**Database**:
- PostgreSQL 15+
- JSONB columns for flexibility
- Indexing for performance

**LLM Integration**:
- OpenAI SDK
- Anthropic SDK
- LiteLLM (unified interface for multiple providers)
- Local model support via Ollama (optional)

**Statistics & Analysis**:
- pandas, numpy
- scipy, pingouin, statsmodels
- scikit-learn (outlier detection)
- matplotlib, seaborn, plotly
- pyreadstat (SPSS/Stata exports)
- pyarrow (parquet support)

**Development Tools**:
- pytest for testing
- ruff for linting
- mypy for type checking
- docker for deployment

---

## Implementation Roadmap

### Phase 1: Foundation (MVP)
**Duration**: 4-6 weeks
**Goal**: End-to-end execution of simple surveys

**Features**:
- Basic experiment builder UI
- Profile generation with rejection sampling
- Single LLM provider (OpenAI)
- Simple persona prompting (Strategy A)
- Descriptive statistics
- CSV export

**Success Criteria**: Run experiment with N=10, receive results table

---

### Phase 2: Research-Ready Analysis
**Duration**: 4-6 weeks
**Goal**: Publication-quality pilot data

**Features**:
- Additional LLM providers (DeepSeek, Claude)
- Cronbach's alpha and item analysis
- T-tests, ANOVA, correlation
- Visualization gallery
- SPSS/R export formats

**Success Criteria**: Generate analyzable dataset for single-factor experiment

---

### Phase 3: Advanced Execution
**Duration**: 4-6 weeks
**Goal**: Multi-method experiments with quality controls

**Features**:
- Multi-agent validation (Strategy C)
- Chain-of-thought (Strategy B)
- Validation-focused (Strategy D)
- Scenario and recall experiment types
- Cost estimation and real-time monitoring

**Success Criteria**: Run complex experiment with quality metrics

---

### Phase 4: Production Platform
**Duration**: 4-6 weeks
**Goal**: Deployable research platform for labs

**Features**:
- Regression models and power analysis
- Template library
- Collaboration features
- Documentation and tutorials
- Performance optimization

**Success Criteria**: Deploy to production, onboard external researchers

---

## Key Design Decisions

### Rationale

1. **Academic research tool → Focus on speed and iteration**
   - Prioritized quick experiment setup and execution
   - Built-in analysis reduces need for external tools

2. **Web UI → Intuitive for non-technical researchers**
   - Low barrier to entry compared to CLI/SDK
   - Visual feedback during experiment design

3. **Mixed experiment types → Maximum flexibility**
   - Surveys, scenarios, and recall in one platform
   - Enables complex multi-method studies

4. **User-provided API keys → Cost transparency**
   - No centralized billing complexity
   - Researchers control their own costs

5. **Intermediate statistics + Cronbach's alpha → Research-ready**
   - Covers most common psychology research needs
   - Includes essential reliability metrics

6. **Multiple validation strategies → Quality vs. cost control**
   - Researchers can choose appropriate rigor level
   - Simple surveys get fast/cheap execution

7. **Standalone experiments → Simplicity for pilots**
   - No complex project hierarchy
   - Each experiment is self-contained

8. **Python-heavy stack → Native statistics**
   - Direct access to pandas/scipy/statsmodels
   - Analysis code exportable to Jupyter

---

## Limitations & Considerations

### Validity Concerns
- **LLM authenticity**: Responses may not accurately reflect human cognition
- **Recommendation**: Use for pilot studies only, validate with human samples before publication

### Cost Management
- **LLM API costs**: Large samples can be expensive, especially with multi-agent strategies
- **Mitigation**: Cost estimation before execution, hard caps on spending

### Demographic Realism
- **LLM training bias**: May not accurately represent all demographics/cultures
- **Mitigation**: Validation checks, comparison to real datasets, researcher review

### Sample Size Constraints
- **Rate limits**: API rate limits may slow large sample execution
- **Mitigation**: Batch processing, progressive execution, local model option

### Ethical Considerations
- **Transparency**: Must clearly label data as synthetic in any publication
- **Not replacement**: Should complement, not replace, human participant studies

---

## Success Metrics

**Technical Metrics**:
- End-to-end experiment execution time: < 10 minutes for N=50
- System uptime: > 99% during active experiments
- API failure recovery: > 95% successful completion despite transient failures

**User Experience Metrics**:
- Time from idea to first results: < 30 minutes
- User error rate in experiment builder: < 5%
- Analysis export success rate: > 99%

**Research Impact Metrics**:
- Pilot data accuracy: > 80% correlation with human sample directionality
- Time savings: 10x faster than human recruitment
- Publication quality: Data passes peer review for pilot studies

---

## Next Steps

1. **Setup development environment**: Initialize project structure, install dependencies
2. **Create implementation plan**: Break down Phase 1 into specific tasks
3. **Begin core development**: Profile generation, basic UI, LLM integration
4. **Internal testing**: Run end-to-end experiments with small samples
5. **Pilot with researchers**: Gather feedback from actual users
6. **Iterate**: Refine based on feedback before Phase 2

---

## Appendix: Example Workflow

**Scenario**: Researcher wants to pilot test a new 10-item well-being scale across different age groups.

**Step 1**: Create experiment
- Set sample: N=100, age range 18-65, stratified by decade
- Select LLM: OpenAI GPT-4o
- Choose strategy: Simple persona (fast)

**Step 2**: Build survey
- Add 10 Likert-scale items (1-7)
- Add demographic questions for validation

**Step 3**: Preview
- Run N=3 test participants
- Review responses, adjust prompt wording

**Step 4**: Execute
- Launch full sample (N=100)
- Monitor progress in real-time
- Estimated cost: ~$15-25

**Step 5**: Analyze
- Automatic Cronbach's alpha calculation
- Compare responses across age strata (ANOVA)
- Export to SPSS for additional analysis

**Total time**: ~2-3 hours vs. 2-4 weeks for human recruitment
