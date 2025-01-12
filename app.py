import os
import webview
from flask import Flask, request, jsonify, send_from_directory
import threading
import subprocess
import datetime
import sys
import logging

log_file = 'app.log'

# 如果日志文件存在，则删除它
if os.path.exists(log_file):
    os.remove(log_file)

# 配置日志
logging.basicConfig(filename=log_file, level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# 创建 Flask 应用
app = Flask(__name__, static_folder='statics')

# 提供 React 静态文件
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

UPLOAD_FOLDER = 'uploads'
RESULT_FOLDER = 'results'

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

if not os.path.exists(RESULT_FOLDER):
    os.makedirs(RESULT_FOLDER)

@app.route('/process', methods=['POST'])
def process_files():
    file1 = request.files['file1']
    file2 = request.files['file2']

    file1_path = os.path.join(UPLOAD_FOLDER, file1.filename)
    file2_path = os.path.join(UPLOAD_FOLDER, file2.filename)

    file1.save(file1_path)
    file2.save(file2_path)

    timestring=datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    # 调用另一个 Python 程序处理文件
    result_file_path = os.path.join(RESULT_FOLDER, 'idle_optical_module_'+timestring+'.xlsx')

    # os.system(f'python process_files.py {file1_path} {file2_path} {result_file_path}')
    if getattr(sys, 'frozen', False):
        # 打包后的路径
        base_path = sys._MEIPASS
    else:
        # 开发时的路径
        base_path = os.path.dirname(__file__)

    # 这里假设处理程序是一个 Python 脚本，你可以替换为实际的调用  
    exe_path = os.path.join(base_path, "find_idle_optical_module_cmd.exe")
    args = [file1_path, file2_path, result_file_path]

    result = subprocess.run([exe_path] + args)

    print("Return code:", result.returncode)
    print("Stdout:", result.stdout)
    print("Stderr:", result.stderr)

    if result.returncode == 0:
        print("File processed successfully.")
        return jsonify({'filePath': result_file_path})
    else:
        print("Error processing file.")
        return jsonify({'error': 'Error processing file.'}), 500
    

@app.route('/download', methods=['GET'])
def download_file():
    file_path = request.args.get('filePath')
    print(f"Requested file path: {file_path}")  # 调试信息
    if getattr(sys, 'frozen', False):
        # 打包后的路径
        # 获取当前运行的 .exe 文件路径
        exe_path = sys.executable

        # 获取 .exe 文件所在的目录
        base_path = os.path.dirname(exe_path)
    else:
        # 开发时的路径
        base_path = os.path.dirname(__file__)

    file_folder = os.path.join(base_path, RESULT_FOLDER)
    print(f"Resolved file path: {os.path.join(RESULT_FOLDER, os.path.basename(file_path))}")  # 调试信息
    print(f"Resolved file path: {file_folder}")
    return send_from_directory(file_folder, os.path.basename(file_path), as_attachment=True)


@app.route('/get_logs', methods=['GET'])
def get_logs():
    try:
        with open('app.log', 'r') as log_file:
            logs = log_file.readlines()
        return jsonify({'logs': logs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def start_server():
    app.run(port=5020)

if __name__ == '__main__':
    t = threading.Thread(target=start_server)
    t.daemon = True
    t.start()
    webview.settings['ALLOW_DOWNLOADS'] = True
    webview.create_window('Idle optical module finder for ZTE UME ', 'http://localhost:5020',width=800, height=600)
    webview.start()