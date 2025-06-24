# CodeCollab AI Test Suite

This directory contains comprehensive testing tools for validating the AI agents in CodeCollab AI.

## Files

- `test-codecollab-agents.py` - Main test suite for AI agents
- `run-ai-tests.sh` - Shell script to run tests with environment setup
- `README.md` - This documentation file

## Test Coverage

The test suite validates all specialized AI agents:

### 🎨 Frontend Specialist
- React component generation with TypeScript
- Tailwind CSS styling and responsive design
- Accessibility features and micro-interactions
- Collaborative UI elements

### ⚙️ Backend Specialist  
- Next.js API routes and middleware
- WebSocket handling for real-time features
- Authentication and security
- Rate limiting and error handling

### 🗃️ Database Specialist
- Comprehensive schema design
- Performance optimization
- Row Level Security policies
- Real-time subscription setup

### 🧪 Testing Specialist
- Unit, integration, and E2E tests
- Performance and accessibility testing
- Mock strategies for external dependencies
- Error boundary and edge case testing

### 🔍 Code Review Specialist
- Code quality analysis
- Security vulnerability detection
- Performance optimization suggestions
- Best practices validation

### 🎯 AI Coordinator
- Task breakdown and delegation
- Multi-agent workflow orchestration
- Risk assessment and mitigation
- Success metrics definition

### 🤝 Collaborative Workflows
- Multi-agent problem-solving scenarios
- Information sharing protocols
- Parallel vs sequential task management
- Real-time debugging processes

## Setup Instructions

### 1. Install Dependencies

```bash
pip install google-generativeai
```

### 2. Set API Key

Option A - Environment Variable:
```bash
export GEMINI_API_KEY=your-api-key-here
```

Option B - Edit the script directly:
```python
API_KEY = "your-actual-api-key-here"
```

### 3. Run Tests

Using the shell script:
```bash
chmod +x scripts/run-ai-tests.sh
./scripts/run-ai-tests.sh
```

Or run Python directly:
```bash
python3 scripts/test-codecollab-agents.py
```

## Test Results

The test suite generates comprehensive results including:

- ✅ **Success Rate**: Percentage of tests passing
- ⏱️ **Response Times**: Performance metrics for each agent  
- 📊 **Quality Scores**: Evaluation of response quality (0-100)
- 🏆 **Performance Rating**: Overall system rating
- 💡 **Recommendations**: Specific improvement suggestions

Results are saved to timestamped JSON files for analysis.

## Understanding Results

### Quality Score Components
- **JSON Validity** (20 points): Proper JSON response format
- **Response Time** (20 points): Under 30 second threshold
- **Criteria Met** (60 points): Agent-specific evaluation criteria

### Performance Ratings
- 🌟🌟🌟🌟🌟 **Excellent** (90-100): Production ready
- 🌟🌟🌟🌟 **Very Good** (80-89): Minor optimizations needed
- 🌟🌟🌟 **Good** (70-79): Some improvements recommended
- 🌟🌟 **Fair** (60-69): Significant improvements needed
- 🌟 **Needs Improvement** (<60): Major issues to address

## Customizing Tests

To add new test scenarios:

1. Add a new test method following the naming pattern `test_agent_name`
2. Include proper evaluation criteria
3. Ensure JSON response validation
4. Add the test to the `run_all_tests()` method

Example:
```python
def test_new_agent(self) -> Dict[str, Any]:
    prompt = """Your test prompt here"""
    
    start_time = time.time()
    response = self.model.generate_content(prompt)
    response_time = time.time() - start_time
    
    return {
        "agent": "new-agent",
        "test": "test_description",
        "prompt": prompt,
        "response": response.text,
        "response_time": response_time,
        "success": self._validate_json_response(response.text),
        "evaluation_criteria": ["criterion1", "criterion2"]
    }
```

## Troubleshooting

### Common Issues

1. **"Module not found" errors**
   ```bash
   pip install google-generativeai
   ```

2. **API key errors**
   - Verify your Gemini API key is correct
   - Check API key permissions and quotas
   - Ensure stable internet connection

3. **Timeout errors**
   - Some tests may take 20-30 seconds
   - Check your internet connection stability
   - Consider increasing timeout thresholds

4. **JSON parsing errors**
   - Indicates the AI agent returned malformed JSON
   - Check the response content for debugging
   - May require prompt refinement

### Getting API Keys

1. Visit [Google AI Studio](https://makersuite.google.com)
2. Create a new API key
3. Copy the key and set it in your environment

## Integration with CodeCollab AI

This test suite validates that the AI agents can:

- Generate production-quality code
- Handle collaborative coding scenarios  
- Provide proper error handling and security
- Work together effectively in multi-agent workflows
- Meet the performance requirements for real-time collaboration

Regular testing ensures the AI agents continue to provide high-quality assistance as the platform evolves.