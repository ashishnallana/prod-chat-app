import requests
import subprocess
import time
import json

BASE_URL = "http://localhost:8000/api/v1"
EMAIL = "323103311041@gvpce.ac.in"
PASSWORD = "123456789"

def log(step, res):
    print(f"\n--- {step} ---")
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")

def run_tests():
    try:
        # 1. Health
        print("\n--- Health Check ---")
        try:
            res = requests.get("http://localhost:8000/health")
            print(f"Status: {res.status_code}, {res.text}")
        except Exception as e:
            print("Gateway not reachable:", e)
            return

        # 2. Signup
        res = requests.post(f"{BASE_URL}/auth/signup", json={"email": EMAIL, "password": PASSWORD})
        log("Signup", res)
        
        if res.status_code == 400 and "already registered" in res.text:
            print("User already exists, proceeding to login...")
            # We don't necessarily need to verify OTP if already verified, but let's see.
        else:
            time.sleep(2) # Wait for Redis to populate
            
            # 3. Get OTP from Redis Container
            print("\n--- Fetching OTP from Redis ---")
            try:
                # Need to use the exact service name in docker-compose, which is "redis"
                otp_bytes = subprocess.check_output(
                    ['docker-compose', 'exec', '-T', 'redis', 'redis-cli', 'get', f'otp:{EMAIL}'],
                    stderr=subprocess.STDOUT
                )
                otp_value = otp_bytes.decode('utf-8').strip().strip('"') # Clean up redis-cli output
                print(f"Found OTP: {otp_value}")
                
                # 4. Verify OTP
                res = requests.post(f"{BASE_URL}/auth/verify-otp", json={"email": EMAIL, "otp": otp_value})
                log("Verify OTP", res)
            except Exception as e:
                print("Could not fetch OTP from Redis:", e)

        # 5. Login
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": PASSWORD})
        log("Login", res)

        if res.status_code != 200:
            print("\nError: Login failed, aborting further tests.")
            return

        token = res.json().get('access_token')
        headers = {"Authorization": f"Bearer {token}"}

        # 6. Search Users
        res = requests.get(f"{BASE_URL}/auth/search?email=3231", headers=headers)
        log("Search Users", res)

        print("\nAll Tests Executed!")
    except Exception as e:
        print("Test script failed:", e)

if __name__ == "__main__":
    run_tests()
