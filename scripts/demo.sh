#!/bin/bash

echo "🎥 MCP Multi-API Server Demo"
echo "=========================="
echo ""
echo "This script demonstrates all available tools"
echo ""

# Function to call MCP tool
call_tool() {
    local tool_name=$1
    local args=$2
    
    echo "📞 Calling tool: $tool_name"
    echo "   Args: $args"
    echo ""
    
    # This is a placeholder - in real usage, Claude would call these tools
    echo "   [Response would appear here]"
    echo ""
    sleep 1
}

echo "🌤️ WEATHER TOOLS"
echo "==============="
call_tool "get_current_weather" '{"city": "London"}'
call_tool "get_weather_forecast" '{"city": "New York", "days": 3}'

echo "💰 FINANCE TOOLS"
echo "==============="
call_tool "get_stock_quote" '{"symbol": "AAPL"}'
call_tool "get_currency_exchange" '{"from": "USD", "to": "EUR"}'
call_tool "get_crypto_price" '{"symbol": "BTC"}'

echo "📰 NEWS TOOLS"
echo "============"
call_tool "get_top_headlines" '{"country": "us", "category": "technology"}'
call_tool "search_news" '{"query": "artificial intelligence", "sortBy": "relevancy"}'
call_tool "get_news_sources" '{"category": "business", "country": "us"}'

echo ""
echo "✅ Demo complete!"
echo ""
echo "To use these tools with Claude:"
echo "1. Configure Claude Desktop with this MCP server"
echo "2. Ask Claude questions like:"
echo "   - 'What's the weather in Paris?'"
echo "   - 'Get me the current price of Tesla stock'"
echo "   - 'Show me the latest AI news'"
echo ""