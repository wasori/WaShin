from flask import Flask, jsonify, request
from flask_cors import CORS
import threading
import numpy as np
import requests
from dotenv import load_dotenv
from trade_with_upbit import trade_with_upbit, stop_trading

# Flask 서버 생성
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # 모든 요청 허용
# 자동매매 상태 저장
trading_status = {"running": False, "ticker": None}

# 자동매매 시작 API
@app.route('/start-trading', methods=['POST'])
def start_trading():
    global trading_thread

    if trading_status["running"]:
        return jsonify({"error": "이미 자동매매가 실행 중입니다!"}), 400
    
    # 자동매매 시작
    stop_trading.clear()
    trading_thread = threading.Thread(target=trade_with_upbit)
    trading_thread.start()
    trading_status["running"] = True  # 상태 업데이트

    return jsonify({"message": "자동매매 시작됨"}), 200

# 자동매매 종료 API
@app.route('/stop-trading', methods=['POST'])
def stop_trading_api():
    global trading_thread

    if not trading_status["running"]:
        return jsonify({"error": "자동매매가 실행 중이 아닙니다!"}), 400

    # 자동매매 중지
    stop_trading.set()
    trading_status["running"] = False  # 상태 업데이트

    # 스레드가 종료될 때까지 대기
    if trading_thread and trading_thread.is_alive():
        trading_thread.join()
    
    return jsonify({"message": "자동매매 종료"}), 200

# 자동매매 상태 확인 API
@app.route('/trading-status', methods=['GET'])
def get_trading_status():
    return jsonify(trading_status), 200

@app.route("/proxy/upbit", methods=["GET"])
def proxy_upbit():
    market = request.args.get("market", "KRW-ETH")
    count = request.args.get("count", 50)
    url = f"https://api.upbit.com/v1/candles/minutes/15?market={market}&count={count}"

    headers = {"Accept": "application/json"}
    response = requests.get(url, headers=headers)

    return jsonify(response.json())  # Upbit 데이터 반환

# 서버 실행
if __name__ == '__main__':
    app.run(debug=True,  host='0.0.0.0', port=5000)
