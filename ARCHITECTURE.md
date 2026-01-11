# Product Management System - Architecture Design

## 1. C1: System Context Diagram

ภาพรวมการทำงานของระบบ แสดงความสัมพันธ์ระหว่างผู้ใช้งานและระบบ

```text
┌─────────────────────────────────────────────────────┐
│                                                     │
│                    System User                      │
│         (เจ้าของร้าน, พนักงาน, ผู้จัดการ)                 │
│                                                     │
└────────────┬────────────────────────────────────────┘
             │
             │ HTTP/JSON
             │ (CRUD Operations)
             │
             ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│       Product Management System                     │
│                                                     │
│  • จัดการข้อมูลสินค้า (CRUD)                             │
│  • คำนวณมูลค่ารวมของสินค้า                              │
│  • กรองสินค้าตาม Category                             │
│  • แสดงสถิติสินค้า                                      │
│                                                     │
└────────────┬────────────────────────────────────────┘
             │
             │ SQL Queries
             │
             ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│              SQLite Database                        │
│               (products.db)                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```
คำอธิบายองค์ประกอบ

System User: ผู้ใช้งานระบบ (เจ้าของร้าน, พนักงาน) ที่ต้องการจัดการข้อมูลสินค้า

Product Management System: ระบบ Software หลักที่ทำหน้าที่ประมวลผล Business Logic

SQLite Database: ระบบฐานข้อมูลภายนอกสำหรับจัดเก็บข้อมูลถาวร


2. C2: Container Diagram (Layered Architecture)
โครงสร้างภายในระบบแบบแยกชั้น (Layered Architecture)
```
Plaintext

┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                     Web UI / HTTP Client                        │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ HTTP/JSON
             │ (GET, POST, PUT, DELETE)
             │
             ▼
╔════════════════════════════════════════════════════════════════╗
║                  PRODUCT MANAGEMENT SYSTEM                     ║
║                     (Express.js Application)                   ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ┌───────────────────────────────────────────────────────────┐ ║
║  │           📋 PRESENTATION LAYER                           │ ║
║  │                                                           │ ║
║  │  • Routes        (productRoutes.js)                       │ ║
║  │  • Controllers   (productController.js)                   │ ║
║  │  • Middlewares   (errorHandler.js)                        │ ║
║  │                                                           │ ║
║  └──────────────────────┬────────────────────────────────────┘ ║
║                         │                                      ║
║                         │ JavaScript Objects                   ║
║                         ▼                                      ║
║  ┌───────────────────────────────────────────────────────────┐ ║
║  │           🧠 BUSINESS LOGIC LAYER                         │ ║
║  │                                                           │ ║
║  │  • Services      (productService.js)                      │ ║
║  │  • Validators    (productValidator.js)                    │ ║
║  │                                                           │ ║
║  │  Business Rules:                                          │ ║
║  │    ✓ Name, price, category required                       │ ║
║  │    ✓ Price must be > 0                                    │ ║
║  │    ✓ Calculate totalValue = Σ(price × stock)              │ ║
║  └──────────────────────┬────────────────────────────────────┘ ║
║                         │                                      ║
║                         │ Data Objects                         ║
║                         ▼                                      ║
║  ┌───────────────────────────────────────────────────────────┐ ║
║  │           💾 DATA ACCESS LAYER                            │ ║
║  │                                                           │ ║
║  │  • Repositories  (productRepository.js)                   │ ║
║  │  • Database      (connection.js)                          │ ║
║  │                                                           │ ║
║  │  Methods:                                                 │ ║
║  │    • findAll, findById, create, update, delete            │ ║
║  └──────────────────────┬────────────────────────────────────┘ ║
╚═════════════════════════╪══════════════════════════════════════╝
                          │
                          │ SQL Queries
                          ▼
              ┌─────────────────────────┐
              │    SQLite Database      │
              │     (products.db)       │
              └─────────────────────────┘
```

3. Layer Responsibilities (หน้าที่ของแต่ละชั้น)

3.1 Presentation Layer (ด่านหน้า)
หน้าที่:

รับ HTTP Request และแปลงข้อมูลเบื้องต้น

เรียกใช้ Business Layer

ส่ง HTTP Response กลับไปหา Client

จัดการ Error ผ่าน Middleware

ไฟล์ที่เกี่ยวข้อง:

productRoutes.js: กำหนด Endpoint (GET, POST, PUT, DELETE)

productController.js: ควบคุม Flow การทำงาน

errorHandler.js: จัดการ Error กลาง

ตัวอย่างโค้ด:
```
JavaScript

// productController.js
async createProduct(req, res, next) {
    try {
        // เรียก Business Layer
        const product = await productService.createProduct(req.body); 
        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
}
```
ข้อห้าม (Don'ts): ❌ ห้ามเขียน SQL Query หรือ Business Logic ในชั้นนี้

3.2 Business Logic Layer (สมองของระบบ)
หน้าที่:

ตรวจสอบความถูกต้องของข้อมูล (Validation)

ประมวลผลตามกฎทางธุรกิจ (Business Rules)

คำนวณค่าต่างๆ (Calculation)

ไฟล์ที่เกี่ยวข้อง:

productService.js: รวม Logic การทำงาน

productValidator.js: ตรวจสอบเงื่อนไขข้อมูล

Business Rules:

Validation: ชื่อ, ราคา, หมวดหมู่ จำเป็นต้องมีข้อมูล

Logic: ราคาสินค้าต้องมากกว่า 0 (price > 0)

Logic: สต็อกสินค้าห้ามติดลบ (stock >= 0)

Calculation: คำนวณมูลค่ารวมได้จาก price * stock

ตัวอย่างโค้ด:
```
JavaScript

// productService.js
async createProduct(data) {
    productValidator.validatePrice(data.price); // Validation
    return await productRepository.create(data); // เรียก Data Layer
}
```
ข้อห้าม (Don'ts): ❌ ห้ามยุ่งเกี่ยวกับ HTTP Request/Response หรือ SQL โดยตรง

3.3 Data Access Layer (คลังข้อมูล)
หน้าที่:

เชื่อมต่อกับฐานข้อมูล

ดำเนินการ CRUD (Create, Read, Update, Delete)

แปลงข้อมูลจาก SQL เป็น Object

ไฟล์ที่เกี่ยวข้อง:

productRepository.js: เก็บคำสั่ง SQL

connection.js: ตั้งค่าการเชื่อมต่อ Database

Methods:

findAll(category), findById(id), create(data), update(id, data), delete(id)

ตัวอย่างโค้ด:
```
JavaScript

// productRepository.js
async create(data) {
    const sql = 'INSERT INTO products (...) VALUES (...)';
    db.run(sql, [...values]); // สั่งงาน Database
}
```
ข้อห้าม (Don'ts): ❌ ห้ามใส่ Business Logic หรือ Validation ในชั้นนี้

4. Data Flow (ลำดับการทำงาน)
ตัวอย่างกรณี: การเพิ่มสินค้าใหม่ (Create Product)
```
Plaintext

1. CLIENT
   │ ส่ง POST /api/products พร้อม JSON Body
   ▼
2. PRESENTATION LAYER (Controller)
   │ รับ Request -> แยกข้อมูลจาก Body
   │ เรียก productService.createProduct()
   ▼
3. BUSINESS LAYER (Service)
   │ เรียก Validator ตรวจสอบราคา (Price > 0)
   │ ถ้าผ่าน -> เรียก productRepository.create()
   ▼
4. DATA ACCESS LAYER (Repository)
   │ สร้างคำสั่ง SQL: INSERT INTO products...
   │ สั่งงาน Database
   ▼
5. DATABASE (SQLite)
   │ บันทึกข้อมูลลงตาราง
   │ ส่งคืน ID ของแถวใหม่
   ▼
6. RESPONSE FLOW
   │ Database -> Repository -> Service -> Controller
   │ Controller ส่ง JSON Response (Status 201) กลับไปหา Client
```

5. Summary Checklist
[x] Separation of Concerns: แยกการทำงานชัดเจน 3 ชั้น

[x] Business Rules: มีการตรวจสอบราคาสินค้าและข้อมูลจำเป็น

[x] Technology: Express.js + SQLite

[x] Architecture: Layered Architecture (Strict Mode)