# Nihongo Master N4 — v0.2.0

Ứng dụng ôn Nhật N5/N4 offline cho Windows (Tauri 2 + React + TypeScript + SQLite).

## Điểm mới v0.2

- **Tiếng Việt là nghĩa mặc định.** Thêm `manual-vi.json` (469 mục từ Nhật–Việt do dự án biên soạn), `manual-grammar-vi.json` (98 mẫu N4), đồng thời giữ nghĩa Việt từ bộ dữ liệu cũ. Với mục chưa có nghĩa Việt, giao diện đánh dấu *Chưa có bản dịch tiếng Việt*; nghĩa tiếng Anh chỉ được xem khi người dùng chủ động mở phần "nghĩa gốc".
- **Từ ghép Kanji có thể bấm.** Chi tiết Kanji cho phép chọn từ ghép, xem cách đọc, nghĩa Việt và câu ví dụ nếu có. Nếu từ chỉ có trong danh sách ví dụ mà chưa xuất hiện trong dữ liệu N4/N5 hoặc từ điển bổ sung, app nêu rõ giới hạn đó.
- **Đọc hiểu dài hơn.** Tổng 14 bài: 8 bài ngắn cũ + 6 bài dài tự biên soạn (mỗi bài khoảng 260–280 ký tự tiếng Nhật), mỗi bài dài có 4–5 câu hỏi và giải thích Việt. Danh sách sắp xếp bài dài trước.
- **Đề luyện 3 phần.** Luyện từ vựng (25′), ngữ pháp + đọc (55′), nghe (35′), 79 câu (số câu có thể thay đổi theo kho dữ liệu). Nghe bằng giọng tổng hợp Nhật sẵn có trên Windows, hội thoại tự biên soạn; có transcript hỗ trợ khi không có voice. Thống kê theo từng phần và giải thích sau khi nộp. **Đây là bài mô phỏng tự biên soạn, không phải đề thi JLPT chính thức hoặc thang điểm chuẩn hóa.**
- Sửa thiếu `serde_json` trong `Cargo.toml` và cấu hình Vite bỏ qua thư mục Rust `src-tauri` khi theo dõi tệp.

## Cách cập nhật dự án đang chạy — giữ 1.311 từ đã đồng bộ

**Ưu tiên dùng tệp `Nihongo-Master-N4-v0.2-PATCH.zip`** nếu bạn đã đồng bộ OpenJLPT trong bản v0.1. Gói patch không chứa và không xóa các file `n4-vocab.json`, `n5-vocab.json`, `n4-grammar.json`, `n5-grammar.json`, `n4-kanji.json`, `n5-kanji.json`. Vì vậy dữ liệu N4/N5 đã tải trên máy sẽ còn nguyên.

1. Tắt Tauri đang chạy (`Ctrl+C` tại terminal).
2. Sao lưu thư mục dự án nếu bạn đã tự sửa mã nguồn.
3. Giải nén PATCH ZIP vào đúng thư mục `C:\Users\LECOO\Downloads\Nihongo-Master-N4`. Chọn **Replace the files in the destination** khi Windows hỏi.
4. Mở VS Code trong thư mục đó, chạy:

```powershell
npm run check:data
npm run desktop:dev
```

Không cần `npm install` lần nữa nếu thư viện bản cũ còn nguyên. Dữ liệu học/tiến độ SQLite được lưu trong thư mục dữ liệu ứng dụng Windows (app identifier **không đổi**), không xóa khi cập nhật mã nguồn. Nên xuất bản sao lưu JSON trong mục Cài đặt trước khi thao tác.

## Nhập từ điển Nhật–Việt để mở rộng bản dịch (tùy chọn)

Nguồn bổ sung: [Bunchaway Từ điển Nhật–Việt](https://github.com/bunchaway/tu-dien-nhat-viet), CC BY-SA 4.0. Đây là công cụ **thử nghiệm** nhằm ghép thêm nghĩa tiếng Việt từ CSV mở, không bảo đảm nhận diện tất cả từ và cần kiểm tra chất lượng bản dịch trước khi phát hành công khai. Cần Internet **một lần lúc xây dựng** để tải CSV lớn (~29 MB):

```powershell
npm run sync:vi
```

Hoặc tải CSV về thủ công, sau đó:

```powershell
node scripts/sync-vi.mjs "D:\DuLieu\final.csv"
```

Script chỉ điền nghĩa Việt cho từ còn thiếu, không thay các nghĩa đã có. Nó yêu cầu tìm được tối thiểu 20 kết quả phù hợp trước khi sửa các file, và in số lượng từ đã ghép. Nếu cấu trúc CSV thay đổi hoặc số từ trùng thấp, script sẽ dừng và giữ dữ liệu cũ. Toàn bộ tra cứu trong app vẫn offline sau bước nhập.

**Lưu ý:** vì dữ liệu có giấy phép CC BY-SA 4.0, khi chia sẻ lại app phải ghi nguồn và tuân thủ điều kiện chia sẻ tương tự. Chi tiết trong `DATA-LICENSE.md`.

## Cài mới từ bản full source

Yêu cầu: Node.js, Rust, Visual Studio C++ Build Tools/MSVC và Windows SDK, WebView2 Runtime. Trên Windows PowerShell:

```powershell
npm install
npm run sync:data       # Tải OpenJLPT N4/N5 một lần (cần Internet)
npm run sync:vi         # Tùy chọn, nhập từ điển Nhật–Việt CC BY-SA
npm run check:data
npm run desktop:dev
```

Đóng gói Windows installer sau khi đã kiểm thử:

```powershell
npm run desktop:build
```

Tauri sinh file installer tại `src-tauri\target\release\bundle\nsis\` nếu build thành công. Khi người dùng mở ứng dụng đóng gói, học tập không cần Internet.

## Dữ liệu và hạn chế hiện tại

- OpenJLPT phân cấp mục từ; danh sách này **không phải danh sách chính thức của ban tổ chức JLPT**.
- Bản dịch Việt thủ công cần được rà soát thêm với các từ đa nghĩa, kính ngữ, ngữ pháp phức tạp.
- Không phải mọi từ trong bộ đã đồng bộ đều có nghĩa tiếng Việt. Mục chưa được dịch được đánh dấu rõ, không âm thầm hiển thị tiếng Anh.
- Một số từ ghép ví dụ từ nguồn Kanji không nằm trong kho từ vựng cấp N4/N5; app sẽ hiển thị thông báo thay vì bịa nghĩa.
- Chất lượng nghe phụ thuộc vào giọng tiếng Nhật TTS của Windows, **không tương đương audio đề thi**. Nếu không có Japanese voice offline, phải cài thêm qua Settings Windows hoặc dùng transcript như bài thực hành đọc hội thoại.
- Bản v0.2 được kiểm tra cú pháp TypeScript và tính hợp lệ JSON; môi trường soạn thảo này không có phụ thuộc npm để chạy biên dịch ứng dụng Windows thực tế. Vui lòng chạy `npm run desktop:dev` trên máy Windows và gửi lỗi mới nếu có.

## Các nguồn chính

- OpenJLPT — https://github.com/evanclan/OpenJLPT (CC BY-SA 4.0)
- Từ điển Nhật–Việt Bunchaway — https://github.com/bunchaway/tu-dien-nhat-viet (CC BY-SA 4.0; chỉ khi bạn chọn nhập)
- JLPT Official, cấu trúc đề và nguồn đề mẫu có bản quyền — https://www.jlpt.jp/e/guideline/testsections.html và https://www.jlpt.jp/e/samples/sampleindex.html

Các bài đọc dài và ngân hàng câu hỏi trong v0.2 do dự án tự biên soạn. Không bao gồm bản sao đề thi chính thức hoặc nội dung giáo trình thương mại.
