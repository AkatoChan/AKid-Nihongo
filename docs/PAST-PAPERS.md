# Kho giải đề theo năm (JLPT N4)

## Phạm vi
Giao diện chọn đề theo năm/kỳ, chọn ngẫu nhiên một đề, đồng hồ bấm giờ, phiếu trả lời và điều hướng câu hỏi. Sau khi nộp, hiển thị số câu đúng/sai/bỏ trống, lọc câu sai, lời giải tiếng Việt và cho phép làm lại câu sai. Điểm tổng được lưu vào lịch sử ứng dụng.

## Dữ liệu đã nhập từ file Word do người dùng chia sẻ

| Tài liệu | Từ vựng | Ngữ pháp | Đọc hiểu | Nghe | Tổng |
| --- | ---: | ---: | ---: | ---: | ---: |
| T7/2025 Word | 28 | 6 | 8 | 0 | 42 |
| T12/2025 Word | 28 | 3 | 0 | 0 | 31 |

**Không thể xác minh đây là đề JLPT chính thức.** Tài liệu T12/2025 có tiêu đề nội bộ "Đề luyện JLPT N4 Đề 2". Các câu lỗi hoặc thiếu chữ khi xuất Word đã bị loại, các câu có thể phục hồi ngữ cảnh đã được chuẩn hóa. Không có phần nghe và không có quy đổi điểm JLPT. Vì bộ đề chỉ là bản trích, đồng hồ đếm lên thay vì áp đặt thời gian thi thật.

Bảy mục Drive còn lại chỉ là shortcut, chưa có file đích đọc được: trong đó có các bộ đề 2015, 2016, 2017 và T7/2023. Không tạo bộ đề giả cho những năm này.

## Định dạng thêm dữ liệu

Tệp: public/content/past-papers.json

- Mỗi đề gồm id, title, year, session ("07"/"12"), status ("partial"/"complete"), sourceNote và questions.
- Mỗi câu hỏi gồm id, type, section, task, prompt, options (4 lựa chọn), answer (0–3), explanation (tiếng Việt).
- Câu đọc hiểu cần thêm sub (ngữ liệu). Câu nghe cần audioScript hay audio được phép sử dụng.
- Lệnh kiểm tra: npm run check:data. Lệnh kiểm tra TypeScript và build: npm run build.
- Không công bố tài liệu có bản quyền khi chưa xác minh quyền phân phối.

## Kiểm thử Windows
1. npm ci
2. npm run check:data
3. npm run build
4. npm run desktop:dev

Giữ nguyên database SQLite và bản dữ liệu tiến độ cũ.