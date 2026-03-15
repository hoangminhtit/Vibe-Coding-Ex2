# Phan tich yeu cau - He thong quan ly thu vien

## 1) Actor

1. Doc gia (Sinh vien)
- Dang ky the thu vien (qua thu thu nhap he thong)
- Tra cuu sach
- Gui yeu cau muon sach
- Tra sach

2. Thu thu
- Quan ly the thu vien (them/sua/xoa)
- Quan ly dau sach va ban sao (them/sua/xoa)
- Quan ly chuyen nganh (them/sua/xoa)
- Lap phieu muon, xu ly tra sach
- Lap bao cao thong ke dinh ky

3. Quan tri he thong
- Quan ly tai khoan nguoi dung he thong
- Tao/sua/xoa nhan vien thu vien
- Gan quyen cho nhan vien (RBAC)

## 2) Use case chinh

### 2.1 Dang nhap va phan quyen
- UC-01: Dang nhap
- UC-02: Dang xuat
- UC-03: Xem thong tin tai khoan
- UC-04: Quan tri phan quyen

### 2.2 Quan ly doc gia/the thu vien
- UC-10: Tao the thu vien
- UC-11: Sua thong tin the
- UC-12: Xoa the
- UC-13: Tim kiem/doc chi tiet the

### 2.3 Quan ly sach
- UC-20: Tao dau sach
- UC-21: Sua dau sach
- UC-22: Xoa dau sach
- UC-23: Tao ban sao sach
- UC-24: Cap nhat tinh trang ban sao
- UC-25: Xoa ban sao sach
- UC-26: Tim kiem sach

### 2.4 Quan ly chuyen nganh
- UC-30: Tao chuyen nganh
- UC-31: Sua chuyen nganh
- UC-32: Xoa chuyen nganh
- UC-33: Gan dau sach vao chuyen nganh

### 2.5 Muon/tra sach
- UC-40: Tao phieu muon
- UC-41: Xac nhan giao sach
- UC-42: Ghi nhan tra sach
- UC-43: Theo doi sach chua tra

### 2.6 Bao cao
- UC-50: Bao cao dau sach muon nhieu nhat
- UC-51: Bao cao doc gia chua tra sach

### 2.7 Quan ly nguoi dung he thong
- UC-60: Tao nhan vien thu vien
- UC-61: Sua thong tin nhan vien
- UC-62: Xoa nhan vien
- UC-63: Tao tai khoan va cap quyen

## 3) Business rules can xac nhan truoc khi code

1. Moi doc gia tai 1 thoi diem chi duoc co 1 phieu muon dang mo (theo de bai: moi lan muon chi 1 cuon).
2. Chi duoc muon ban sao co tinh trang SAN_SANG.
3. Khi lap phieu muon, the doc gia phai ton tai va hop le.
4. Khi tra sach, cap nhat ngay tra va tinh trang tra.
5. Khong cho xoa ban ghi dang phat sinh lien quan active (VD: khong xoa doc gia dang muon sach).
6. Bao cao co bo loc theo khoang thoi gian (tu ngay/den ngay).

## 4) De xuat MVP

- Sprint 1: Dang nhap, quan ly doc gia, quan ly dau sach + ban sao.
- Sprint 2: Muon/tra sach, rang buoc nghiep vu, bao cao co ban.
- Sprint 3: Quan ly nguoi dung, phan quyen chi tiet, hardening va test.
