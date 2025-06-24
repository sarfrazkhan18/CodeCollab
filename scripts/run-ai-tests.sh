#!/bin/bash

# CodeCollab AI Agent Test Runner
echo "🤖 CodeCollab AI Agent Test Suite"
echo "=================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if google-generativeai is installed
if ! python3 -c "import google.generativeai" &> /dev/null; then
    echo "📦 Installing google-generativeai package..."
    pip install google-generativeai
fi

# Check if API key is set
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  GEMINI_API_KEY environment variable not set."
    echo "Please set your API key:"
    echo "export GEMINI_API_KEY=your-api-key-here"
    echo ""
    echo "Or edit the API_KEY variable in test-codecollab-agents.py"
    exit 1
fi

# Run the test suite
echo "🚀 Starting CodeCollab AI Agent tests..."
python3 scripts/test-codecollab-agents.py

echo "✅ Test suite completed!"