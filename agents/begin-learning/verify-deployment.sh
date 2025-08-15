#!/bin/bash

echo "🔍 Verifying Begin Learning Profile Agent Deployment..."

# Check if all agent files exist
agents=(
    "assessment-scoring-engine.md"
    "activity-matching-agent.md" 
    "profile-narrative-generator.md"
    "content-tagging-agent.md"
    "profile-validation-agent.md"
    "parent-communication-assistant.md"
)

all_present=true
for agent in "${agents[@]}"; do
    if [ -f "agents/begin-learning/$agent" ]; then
        echo "✅ Found: $agent"
    else
        echo "❌ Missing: $agent"
        all_present=false
    fi
done

if [ "$all_present" = true ]; then
    echo ""
    echo "🎉 All Begin Learning Profile agents deployed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Copy the agents/begin-learning directory to ~/.claude/agents/"
    echo "2. Restart Claude Code"
    echo "3. Test with: 'Process a sample assessment using Begin Learning Profile agents'"
    echo ""
    echo "The agents will automatically coordinate to handle:"
    echo "- Assessment scoring and archetype assignment"
    echo "- Personalized activity recommendations"
    echo "- Parent-friendly profile narratives"
    echo "- Quality validation and error checking"
else
    echo ""
    echo "❌ Deployment incomplete. Please check for missing files."
fi
