import sys

def process_files(file1_path, file2_path, result_file_path):
    with open(file1_path, 'r') as file1, open(file2_path, 'r') as file2:
        content1 = file1.read()
        content2 = file2.read()

    # 这里可以编写处理逻辑
    result_content = f"Processed {content1} and {content2}"

    with open(result_file_path, 'w') as result_file:
        result_file.write(result_content)

if __name__ == '__main__':
    file1_path = sys.argv[1]
    file2_path = sys.argv[2]
    result_file_path = sys.argv[3]
    process_files(file1_path, file2_path, result_file_path)