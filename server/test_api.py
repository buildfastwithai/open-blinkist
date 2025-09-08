#!/usr/bin/env python3
"""
Quick test script to verify the API endpoints work correctly.
Run this after starting the server to test functionality.
"""

import requests
import json
import time

API_BASE = "http://localhost:8080"

def test_health():
    """Test the health endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{API_BASE}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_book_summary():
    """Test book summarization endpoint"""
    print("\n📖 Testing book summarization...")
    
    test_request = {
        "book_name": "Atomic Habits",
        "role": "startup founder",
        "num_insights": 3
    }
    
    try:
        print(f"Sending request: {test_request}")
        response = requests.post(
            f"{API_BASE}/summarize_book",
            json=test_request,
            timeout=60  # AI requests can take time
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Book summary generated successfully!")
            print(f"Book: {data['book_name']} by {data['author']}")
            print(f"Insights for: {data['role']}")
            print(f"Number of insights: {len(data['key_insights'])}")
            
            for i, insight in enumerate(data['key_insights'], 1):
                print(f"\n{i}. {insight['heading']}")
                for bullet in insight['bullet_points']:
                    print(f"   • {bullet}")
            
            return data
        else:
            print(f"❌ Book summary failed: {response.status_code}")
            print(f"Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Book summary error: {e}")
        return None

def test_conversation(book_summary):
    """Test conversation generation endpoint"""
    if not book_summary:
        print("❌ Skipping conversation test - no book summary available")
        return None
        
    print("\n💬 Testing conversation generation...")
    
    try:
        response = requests.post(
            f"{API_BASE}/convert_to_conversation",
            json={"book_summary": book_summary},
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Conversation generated successfully!")
            print(f"Book: {data['book_name']}")
            print(f"Participants: {', '.join(data['participants'])}")
            
            # Show first few lines of conversation
            lines = data['conversation'].split('\n')[:6]
            print("\nFirst few lines of conversation:")
            for line in lines:
                if line.strip():
                    print(f"  {line}")
            
            return data
        else:
            print(f"❌ Conversation generation failed: {response.status_code}")
            print(f"Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Conversation generation error: {e}")
        return None

def test_full_experience():
    """Test the full book experience endpoint"""
    print("\n🚀 Testing full book experience...")
    
    test_request = {
        "book_name": "Deep Work",
        "role": "software engineer",
        "num_insights": 3
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/full_book_experience",
            json=test_request,
            timeout=120  # This endpoint does two AI calls
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Full book experience generated successfully!")
            
            summary = data['book_summary']
            conversation = data['conversation']
            
            print(f"Summary: {summary['book_name']} by {summary['author']}")
            print(f"Conversation: {len(conversation['conversation'].split())} words")
            
            return data
        else:
            print(f"❌ Full experience failed: {response.status_code}")
            print(f"Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Full experience error: {e}")
        return None

def main():
    """Run all tests"""
    print("🧪 Starting API Tests")
    print("=" * 50)
    
    # Test health first
    if not test_health():
        print("\n❌ Server appears to be down. Please start the server first:")
        print("   cd server && python run.py")
        return
    
    # Test book summarization
    book_summary = test_book_summary()
    
    # Test conversation generation
    conversation = test_conversation(book_summary)
    
    # Test full experience
    full_experience = test_full_experience()
    
    print("\n" + "=" * 50)
    print("🎉 API Testing Complete!")
    
    # Summary
    tests_passed = sum([
        book_summary is not None,
        conversation is not None,
        full_experience is not None
    ])
    
    print(f"✅ Tests passed: {tests_passed}/3")
    
    if tests_passed == 3:
        print("🎊 All tests passed! Your API is working correctly.")
        print("\n🌐 Ready to use:")
        print("   Frontend: http://localhost:3000")
        print("   API Docs: http://localhost:8080/docs")
    else:
        print("⚠️  Some tests failed. Check your Groq API key and configuration.")

if __name__ == "__main__":
    main()
