# Service-Booking-Management-Demo
## Mô tả dự án
Ứng dụng web full-stack cho phép khách hàng đặt lịch sử dụng dịch vụ với một nhân viên tại một khung giờ cụ thể, đồng thời cho phép Admin quản lý dịch vụ, nhân viên, lịch làm việc và toàn bộ booking. Không tích hợp thanh toán.

## Hướng dẫn cài đặt

### 1. Yêu cầu môi trường
| Công cụ | Phiên bản |
|---|---|
| [.NET SDK](https://dotnet.microsoft.com/download) | 8.x |
| [Node.js](https://nodejs.org/) | v22.12.0 (đã kèm npm) |
| Microsoft SQL Server | Microsoft SQL Server 2022 (RTM) - 16.0.1000.6|
| Công cụ SQL | SSMS, Azure Data Studio hoặc `sqlcmd` (để chạy script dữ liệu mẫu) |
| EF Core CLI | `dotnet tool install --global dotnet-ef` |

## 2. Cấu trúc dự án

```
Service_Booking_Management_Demo/
├── SERVICE_BOOKING_MANAGEMENT_BACKEND/   # App Backend (API, services, DAO / EF Core)
│   └── SERVICE_BOOKING_MANAGEMENT_DAO/   # DbContext, entity, migration
├── <FRONTEND_FOLDER>/                    # Ứng dụng Next.js (Frontend của app)
│   └── src/
│       ├── app/          # Các trang: (auth)/login, (customer)/..., admin/...
│       ├── components/   # Các ui, shared, forms được chia sẻ và sử dụng
│       ├── services/     # Gọi API (api.ts, auth, booking, ...)
│       ├── types/        # Data Model của front end, sử dụng TypeScript để tương ứng với DTO của backend
│       └── lib/          # validator, định dạng, hằng số
└── README.md
```

## 3. Cài đặt cơ sở dữ liệu

  **Cấu hình connection string** trong `appsettings.json` (hoặc `appsettings.Development.json`) của project API. Ví dụ với SQL Server Express dùng Windows authentication:

   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Data Source={Đặt đúng server instance ở đây};Initial Catalog=ServiceBookingManagementDB;Integrated Security=True;Trust Server Certificate=True"
   }
   ```

   Chỉnh `Data Source=` cho đúng instance của bạn (ví dụ `localhost`, `(localdb)\\MSSQLLocalDB`, hoặc thêm `User Id=...;Password=...;` nếu dùng SQL authentication).

   **Sử dụng SQL Script**
   Trong file Documentation (hay là trong git), sẽ có file là ServiceBookingManagementDB.sql để tạo Database, trong đó đã có schema và data mẫu

   **Tạo schema** bằng EF Core migration, chạy từ thư mục Migration trongSERVICE_BOOKING_MANAGEMENT_BACKEND/SERVICE_BOOKING_MANAGEMENT_DAO. Phương pháp này chỉ tạo ra schema, không có data mẫu:

   ```bash
   dotnet ef database update --project SERVICE_BOOKING_MANAGEMENT_BACKEND/SERVICE_BOOKING_MANAGEMENT_DAO --startup-project SERVICE_BOOKING_MANAGEMENT_BACKEND/<API_PROJECT_FOLDER>
   ```

Dữ liệu mẫu gồm 1 Admin, 2 Customer, 2 nhân viên, 5 dịch vụ, lịch làm việc trong 7 ngày và 10 booking thuộc nhiều trạng thái.

---

## 4. Chạy backend

```bash
cd SERVICE_BOOKING_MANAGEMENT_BACKEND/<API_PROJECT_FOLDER>
dotnet run --launch-profile https
```

- Địa chỉ API: **https://localhost:7188**
- Swagger UI: **https://localhost:7188/swagger**

Nếu trình duyệt từ chối chứng chỉ HTTPS dành cho môi trường phát triển, hãy tin cậy chứng chỉ một lần rồi khởi động lại trình duyệt:

```bash
dotnet dev-certs https --trust
```

Chính sách CORS của API phải cho phép origin của frontend là `http://localhost:3000` (đã cấu hình trong `Program.cs`).

---

## 5. Chạy frontend

```bash
cd <FRONTEND_FOLDER>
npm install
```

Tạo file `.env.local` ở thư mục gốc của frontend:

```
NEXT_PUBLIC_API_BASE_URL=https://localhost:7188
```

Sau đó khởi động dev server:

```bash
npm run dev
```

- Địa chỉ ứng dụng: **http://localhost:3000**

Các biến `NEXT_PUBLIC_*` chỉ được đọc khi dev server khởi động, vì vậy hãy khởi động lại `npm run dev` sau khi sửa `.env.local`. Để build production, chạy `npm run build` rồi `npm start`.

---

## Tài khoản cho demo
**-Tài khoản 1:**

-Tên: Nguyen Van Ha

-Email: HaVNadmin@example.com

-Mật khẩu: test1234

-Role: Admin (Người quản trị)

**-Tài khoản 2:**

-Tên: Tran Trong Tin

-Email: TinTrongT23@example.com

-Mật khẩu: HaHaX32

-Role: Customer (Khách hàng)

**-Tài khoản 3:**

-Tên: Nguyen Ha Giang

-Email: GiangHa333@example.com

-Mật khẩu: IEU823x

-Role: Customer (Khách hàng)

