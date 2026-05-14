-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: agapay_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `tenant_groups`
--

LOCK TABLES `tenant_groups` WRITE;
/*!40000 ALTER TABLE `tenant_groups` DISABLE KEYS */;
INSERT INTO `tenant_groups` VALUES (1,'NCR Sector','AGP_NCR',1,'2026-05-13 15:57:31.999','2026-05-13 15:57:31.999');
INSERT INTO `tenant_groups` VALUES (2,'Central Luzon Sector','AGP_CL',1,'2026-05-13 15:57:32.004','2026-05-13 15:57:32.004');
INSERT INTO `tenant_groups` VALUES (3,'Southern Tagalog Sector','AGP_ST',1,'2026-05-13 15:57:32.011','2026-05-13 15:57:32.011');
/*!40000 ALTER TABLE `tenant_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES (1,NULL,'Agapay System','apex','#009966',NULL,'inter_outfit',NULL,1,'2026-05-13 15:57:32.017','2026-05-13 15:57:32.017','prospect',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `tenants` VALUES (2,2,'Malolos Market Vendors Cooperative','malolos','#2563eb',NULL,'inter_outfit',NULL,1,'2026-05-13 15:57:32.049','2026-05-13 15:57:32.049','prospect',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `tenants` VALUES (3,2,'San Jose Rural Workers Coop','san_jose','#059669',NULL,'inter_outfit',NULL,1,'2026-05-13 15:57:32.209','2026-05-13 15:57:32.209','prospect',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `tenants` VALUES (4,1,'Quezon City Vendors Trust','qc_vendors','#d97706',NULL,'inter_outfit',NULL,1,'2026-05-13 15:57:32.355','2026-05-13 15:57:32.355','prospect',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `tenants` VALUES (5,1,'Makati Business Sari-Sari Coop','makati_business','#dc2626',NULL,'inter_outfit',NULL,1,'2026-05-13 15:57:32.459','2026-05-13 15:57:32.459','prospect',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `tenants` VALUES (6,3,'Calamba Agricultural Cooperative','calamba_agri','#7c3aed',NULL,'inter_outfit',NULL,1,'2026-05-13 15:57:32.632','2026-05-13 15:57:32.632','prospect',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `subscription_plans`
--

LOCK TABLES `subscription_plans` WRITE;
/*!40000 ALTER TABLE `subscription_plans` DISABLE KEYS */;
INSERT INTO `subscription_plans` VALUES (1,'Agapay Core',1200.00,3500.00,0.00,0.00,500,5000,'[\"Basic Admin Dashboard\",\"Audit Logs\",\"Email Support\"]',1,0,3000,10000,'2026-05-13 15:57:31.982','2026-05-13 15:57:31.982');
INSERT INTO `subscription_plans` VALUES (2,'Agapay Pro',1500.00,0.00,6500.00,0.00,2500,25000,'[\"Custom Branding\",\"Priority Support\",\"Compassion Workflow\"]',1,0,3000,10000,'2026-05-13 15:57:31.988','2026-05-13 15:57:31.988');
INSERT INTO `subscription_plans` VALUES (3,'Agapay Enterprise',2000.00,0.00,0.00,12000.00,1000000,100000,'[\"Analytics Module\",\"Technical Support\",\"Reputation System\"]',1,0,3000,10000,'2026-05-13 15:57:31.994','2026-05-13 15:57:31.994');
/*!40000 ALTER TABLE `subscription_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tenant_subscriptions`
--

LOCK TABLES `tenant_subscriptions` WRITE;
/*!40000 ALTER TABLE `tenant_subscriptions` DISABLE KEYS */;
INSERT INTO `tenant_subscriptions` VALUES (1,2,1,'monthly','active','2025-12-13 15:57:32.054','2026-01-13 15:57:32.054','2026-05-13 15:57:32.057','2026-05-13 15:57:32.057','[\"wallet\",\"loans\",\"community\",\"audit\"]');
INSERT INTO `tenant_subscriptions` VALUES (2,3,2,'annually','active','2026-01-13 15:57:32.211','2027-01-13 15:57:32.211','2026-05-13 15:57:32.212','2026-05-13 15:57:32.212','[\"wallet\",\"loans\",\"community\",\"audit\"]');
INSERT INTO `tenant_subscriptions` VALUES (3,4,3,'semi_annually','active','2026-03-13 15:57:32.358','2026-09-13 15:57:32.358','2026-05-13 15:57:32.360','2026-05-13 15:57:32.360','[\"wallet\",\"loans\",\"community\",\"audit\"]');
INSERT INTO `tenant_subscriptions` VALUES (4,5,1,'quarterly','active','2026-03-13 15:57:32.464','2026-06-13 15:57:32.464','2026-05-13 15:57:32.466','2026-05-13 15:57:32.466','[\"wallet\",\"loans\",\"community\",\"audit\"]');
INSERT INTO `tenant_subscriptions` VALUES (5,6,2,'monthly','active','2026-03-13 15:57:32.636','2026-04-13 15:57:32.636','2026-05-13 15:57:32.636','2026-05-13 15:57:32.636','[\"wallet\",\"loans\",\"community\",\"audit\"]');
/*!40000 ALTER TABLE `tenant_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `loan_products`
--

LOCK TABLES `loan_products` WRITE;
/*!40000 ALTER TABLE `loan_products` DISABLE KEYS */;
/*!40000 ALTER TABLE `loan_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'AGP-S-000001','superadmin','agapay.saas@gmail.com',NULL,'$2y$12$PDtktQWkazOFp293DOey9OIA1D3mXv1Z1zlMtQwI/V88UadCh1yzu','superadmin','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.039','2026-05-13 15:57:32.039',NULL,NULL);
INSERT INTO `users` VALUES (2,2,'MALOLOS-O-ILP7-0001','fernando-aquino-MALOLOS-O-ILP7-0001','fernando.aquino.MALOLOS-O-ILP7-0001@gmail.com',NULL,'$2y$12$Ka7lQG2otG9QMlf8lHJUD.esXxJiSHOkDuO/uHoKHwQwNYN1gYf.e','operator','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.082','2026-05-13 15:57:32.082',NULL,NULL);
INSERT INTO `users` VALUES (3,2,'MALOLOS-M-7793-0001','eduardo-navarro-MALOLOS-M-7793-0001','eduardo.navarro.MALOLOS-M-7793-0001@gmail.com',NULL,'$2y$12$52UdfhnKfkReiy8fRgjVyOaM37H2pTB8C7vyL0tYiFJpmM9BAsKyO','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.089','2026-05-13 15:57:32.089',NULL,NULL);
INSERT INTO `users` VALUES (4,2,'MALOLOS-M-A579-0002','angelica-bautista-MALOLOS-M-A579-0002','angelica.bautista.MALOLOS-M-A579-0002@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.092','2026-05-13 15:57:32.092',NULL,NULL);
INSERT INTO `users` VALUES (5,2,'MALOLOS-M-OKVL-0003','ernesto-navarro-MALOLOS-M-OKVL-0003','ernesto.navarro.MALOLOS-M-OKVL-0003@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.096','2026-05-13 15:57:32.096',NULL,NULL);
INSERT INTO `users` VALUES (6,2,'MALOLOS-M-7XLR-0004','eduardo-valencia-MALOLOS-M-7XLR-0004','eduardo.valencia.MALOLOS-M-7XLR-0004@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.099','2026-05-13 15:57:32.099',NULL,NULL);
INSERT INTO `users` VALUES (7,2,'MALOLOS-M-BIX2-0005','fernando-soriano-MALOLOS-M-BIX2-0005','fernando.soriano.MALOLOS-M-BIX2-0005@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.103','2026-05-13 15:57:32.103',NULL,NULL);
INSERT INTO `users` VALUES (8,2,'MALOLOS-M-RGFX-0006','cecilia-pascual-MALOLOS-M-RGFX-0006','cecilia.pascual.MALOLOS-M-RGFX-0006@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.106','2026-05-13 15:57:32.106',NULL,NULL);
INSERT INTO `users` VALUES (9,2,'MALOLOS-M-OTX7-0007','lourdes-gonzales-MALOLOS-M-OTX7-0007','lourdes.gonzales.MALOLOS-M-OTX7-0007@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.109','2026-05-13 15:57:32.109',NULL,NULL);
INSERT INTO `users` VALUES (10,2,'MALOLOS-M-PL4P-0008','gloria-pascual-MALOLOS-M-PL4P-0008','gloria.pascual.MALOLOS-M-PL4P-0008@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.111','2026-05-13 15:57:32.111',NULL,NULL);
INSERT INTO `users` VALUES (11,2,'MALOLOS-M-YIG2-0009','carlos-ramos-MALOLOS-M-YIG2-0009','carlos.ramos.MALOLOS-M-YIG2-0009@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.114','2026-05-13 15:57:32.114',NULL,NULL);
INSERT INTO `users` VALUES (12,2,'MALOLOS-M-993M-0010','carmen-domingo-MALOLOS-M-993M-0010','carmen.domingo.MALOLOS-M-993M-0010@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.117','2026-05-13 15:57:32.117',NULL,NULL);
INSERT INTO `users` VALUES (13,2,'MALOLOS-M-HF5O-0011','remedios-reyes-MALOLOS-M-HF5O-0011','remedios.reyes.MALOLOS-M-HF5O-0011@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.119','2026-05-13 15:57:32.119',NULL,NULL);
INSERT INTO `users` VALUES (14,2,'MALOLOS-M-VRHY-0012','ricardo-mercado-MALOLOS-M-VRHY-0012','ricardo.mercado.MALOLOS-M-VRHY-0012@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.122','2026-05-13 15:57:32.122',NULL,NULL);
INSERT INTO `users` VALUES (15,2,'MALOLOS-M-3CFI-0013','ligaya-torres-MALOLOS-M-3CFI-0013','ligaya.torres.MALOLOS-M-3CFI-0013@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.125','2026-05-13 15:57:32.125',NULL,NULL);
INSERT INTO `users` VALUES (16,2,'MALOLOS-M-OLPL-0014','rolando-mercado-MALOLOS-M-OLPL-0014','rolando.mercado.MALOLOS-M-OLPL-0014@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.127','2026-05-13 15:57:32.127',NULL,NULL);
INSERT INTO `users` VALUES (17,2,'MALOLOS-M-R12M-0015','merlinda-villanueva-MALOLOS-M-R12M-0015','merlinda.villanueva.MALOLOS-M-R12M-0015@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.130','2026-05-13 15:57:32.130',NULL,NULL);
INSERT INTO `users` VALUES (18,2,'MALOLOS-M-6AKM-0016','ricardo-castillo-MALOLOS-M-6AKM-0016','ricardo.castillo.MALOLOS-M-6AKM-0016@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.132','2026-05-13 15:57:32.132',NULL,NULL);
INSERT INTO `users` VALUES (19,2,'MALOLOS-M-ET0T-0017','ricardo-reyes-MALOLOS-M-ET0T-0017','ricardo.reyes.MALOLOS-M-ET0T-0017@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.134','2026-05-13 15:57:32.134',NULL,NULL);
INSERT INTO `users` VALUES (20,2,'MALOLOS-M-M68O-0018','remedios-valencia-MALOLOS-M-M68O-0018','remedios.valencia.MALOLOS-M-M68O-0018@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.137','2026-05-13 15:57:32.137',NULL,NULL);
INSERT INTO `users` VALUES (21,2,'MALOLOS-M-ISXZ-0019','jocelyn-navarro-MALOLOS-M-ISXZ-0019','jocelyn.navarro.MALOLOS-M-ISXZ-0019@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.139','2026-05-13 15:57:32.139',NULL,NULL);
INSERT INTO `users` VALUES (22,2,'MALOLOS-M-WFLX-0020','lourdes-santos-MALOLOS-M-WFLX-0020','lourdes.santos.MALOLOS-M-WFLX-0020@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.142','2026-05-13 15:57:32.142',NULL,NULL);
INSERT INTO `users` VALUES (23,2,'MALOLOS-M-LPOB-0021','danilo-lopez-MALOLOS-M-LPOB-0021','danilo.lopez.MALOLOS-M-LPOB-0021@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.144','2026-05-13 15:57:32.144',NULL,NULL);
INSERT INTO `users` VALUES (24,3,'SAN_JOSE-O-R9XC-0001','jocelyn-garcia-SAN_JOSE-O-R9XC-0001','jocelyn.garcia.SAN_JOSE-O-R9XC-0001@gmail.com',NULL,'$2b$10$DIz3z1S0EYeyyke96C4kx.tD9cOjXUnylXIwoVkbZU81UbEloUf8a','operator','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.233','2026-05-13 15:57:32.233',NULL,NULL);
INSERT INTO `users` VALUES (25,3,'SAN_JOSE-M-NOZV-0001','arturo-cruz-SAN_JOSE-M-NOZV-0001','arturo.cruz.SAN_JOSE-M-NOZV-0001@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.237','2026-05-13 15:57:32.237',NULL,NULL);
INSERT INTO `users` VALUES (26,3,'SAN_JOSE-M-5ZPT-0002','carmen-pascual-SAN_JOSE-M-5ZPT-0002','carmen.pascual.SAN_JOSE-M-5ZPT-0002@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.239','2026-05-13 15:57:32.239',NULL,NULL);
INSERT INTO `users` VALUES (27,3,'SAN_JOSE-M-ZFGB-0003','luisa-soriano-SAN_JOSE-M-ZFGB-0003','luisa.soriano.SAN_JOSE-M-ZFGB-0003@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.249','2026-05-13 15:57:32.249',NULL,NULL);
INSERT INTO `users` VALUES (28,3,'SAN_JOSE-M-8PZN-0004','maria-valencia-SAN_JOSE-M-8PZN-0004','maria.valencia.SAN_JOSE-M-8PZN-0004@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.257','2026-05-13 15:57:32.257',NULL,NULL);
INSERT INTO `users` VALUES (29,3,'SAN_JOSE-M-NSZW-0005','lourdes-garcia-SAN_JOSE-M-NSZW-0005','lourdes.garcia.SAN_JOSE-M-NSZW-0005@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.260','2026-05-13 15:57:32.260',NULL,NULL);
INSERT INTO `users` VALUES (30,3,'SAN_JOSE-M-AORI-0006','rolando-salazar-SAN_JOSE-M-AORI-0006','rolando.salazar.SAN_JOSE-M-AORI-0006@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.262','2026-05-13 15:57:32.262',NULL,NULL);
INSERT INTO `users` VALUES (31,3,'SAN_JOSE-M-5I2L-0007','elena-rivera-SAN_JOSE-M-5I2L-0007','elena.rivera.SAN_JOSE-M-5I2L-0007@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.265','2026-05-13 15:57:32.265',NULL,NULL);
INSERT INTO `users` VALUES (32,3,'SAN_JOSE-M-QPB6-0008','marites-reyes-SAN_JOSE-M-QPB6-0008','marites.reyes.SAN_JOSE-M-QPB6-0008@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.269','2026-05-13 15:57:32.269',NULL,NULL);
INSERT INTO `users` VALUES (33,3,'SAN_JOSE-M-6L6W-0009','roberto-villanueva-SAN_JOSE-M-6L6W-0009','roberto.villanueva.SAN_JOSE-M-6L6W-0009@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.272','2026-05-13 15:57:32.272',NULL,NULL);
INSERT INTO `users` VALUES (34,3,'SAN_JOSE-M-V3T1-0010','ernesto-navarro-SAN_JOSE-M-V3T1-0010','ernesto.navarro.SAN_JOSE-M-V3T1-0010@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.274','2026-05-13 15:57:32.274',NULL,NULL);
INSERT INTO `users` VALUES (35,3,'SAN_JOSE-M-NVMW-0011','elena-garcia-SAN_JOSE-M-NVMW-0011','elena.garcia.SAN_JOSE-M-NVMW-0011@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.277','2026-05-13 15:57:32.277',NULL,NULL);
INSERT INTO `users` VALUES (36,3,'SAN_JOSE-M-SZRS-0012','rowena-santos-SAN_JOSE-M-SZRS-0012','rowena.santos.SAN_JOSE-M-SZRS-0012@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.279','2026-05-13 15:57:32.279',NULL,NULL);
INSERT INTO `users` VALUES (37,3,'SAN_JOSE-M-SH1I-0013','angelica-salazar-SAN_JOSE-M-SH1I-0013','angelica.salazar.SAN_JOSE-M-SH1I-0013@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.281','2026-05-13 15:57:32.281',NULL,NULL);
INSERT INTO `users` VALUES (38,3,'SAN_JOSE-M-UMN3-0014','emilio-rivera-SAN_JOSE-M-UMN3-0014','emilio.rivera.SAN_JOSE-M-UMN3-0014@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.284','2026-05-13 15:57:32.284',NULL,NULL);
INSERT INTO `users` VALUES (39,3,'SAN_JOSE-M-9X7D-0015','eduardo-santos-SAN_JOSE-M-9X7D-0015','eduardo.santos.SAN_JOSE-M-9X7D-0015@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.287','2026-05-13 15:57:32.287',NULL,NULL);
INSERT INTO `users` VALUES (40,3,'SAN_JOSE-M-PGBO-0016','rolando-soriano-SAN_JOSE-M-PGBO-0016','rolando.soriano.SAN_JOSE-M-PGBO-0016@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.289','2026-05-13 15:57:32.289',NULL,NULL);
INSERT INTO `users` VALUES (41,3,'SAN_JOSE-M-M2HA-0017','angelica-bautista-SAN_JOSE-M-M2HA-0017','angelica.bautista.SAN_JOSE-M-M2HA-0017@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.292','2026-05-13 15:57:32.292',NULL,NULL);
INSERT INTO `users` VALUES (42,3,'SAN_JOSE-M-E22L-0018','marites-valencia-SAN_JOSE-M-E22L-0018','marites.valencia.SAN_JOSE-M-E22L-0018@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.295','2026-05-13 15:57:32.295',NULL,NULL);
INSERT INTO `users` VALUES (43,3,'SAN_JOSE-M-ZK8N-0019','rolando-fernandez-SAN_JOSE-M-ZK8N-0019','rolando.fernandez.SAN_JOSE-M-ZK8N-0019@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.297','2026-05-13 15:57:32.297',NULL,NULL);
INSERT INTO `users` VALUES (44,3,'SAN_JOSE-M-X45R-0020','luisa-bautista-SAN_JOSE-M-X45R-0020','luisa.bautista.SAN_JOSE-M-X45R-0020@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.299','2026-05-13 15:57:32.299',NULL,NULL);
INSERT INTO `users` VALUES (45,3,'SAN_JOSE-M-JYL6-0021','danilo-torres-SAN_JOSE-M-JYL6-0021','danilo.torres.SAN_JOSE-M-JYL6-0021@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.302','2026-05-13 15:57:32.302',NULL,NULL);
INSERT INTO `users` VALUES (46,3,'SAN_JOSE-M-76A6-0022','rosario-aquino-SAN_JOSE-M-76A6-0022','rosario.aquino.SAN_JOSE-M-76A6-0022@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.304','2026-05-13 15:57:32.304',NULL,NULL);
INSERT INTO `users` VALUES (47,3,'SAN_JOSE-M-NB5D-0023','carlos-garcia-SAN_JOSE-M-NB5D-0023','carlos.garcia.SAN_JOSE-M-NB5D-0023@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.306','2026-05-13 15:57:32.306',NULL,NULL);
INSERT INTO `users` VALUES (48,3,'SAN_JOSE-M-YR6I-0024','danilo-flores-SAN_JOSE-M-YR6I-0024','danilo.flores.SAN_JOSE-M-YR6I-0024@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.308','2026-05-13 15:57:32.308',NULL,NULL);
INSERT INTO `users` VALUES (49,4,'QC_VENDORS-O-BJTQ-00','danilo-gonzales-QC_VENDORS-O-BJTQ-0001','danilo.gonzales.QC_VENDORS-O-BJTQ-0001@gmail.com',NULL,'$2b$10$DIz3z1S0EYeyyke96C4kx.tD9cOjXUnylXIwoVkbZU81UbEloUf8a','operator','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.376','2026-05-13 15:57:32.376',NULL,NULL);
INSERT INTO `users` VALUES (50,4,'QC_VENDORS-M-FAD0-00','fernando-valencia-QC_VENDORS-M-FAD0-0001','fernando.valencia.QC_VENDORS-M-FAD0-0001@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.379','2026-05-13 15:57:32.379',NULL,NULL);
INSERT INTO `users` VALUES (51,4,'QC_VENDORS-M-SSYW-00','ligaya-villanueva-QC_VENDORS-M-SSYW-0002','ligaya.villanueva.QC_VENDORS-M-SSYW-0002@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.382','2026-05-13 15:57:32.382',NULL,NULL);
INSERT INTO `users` VALUES (52,4,'QC_VENDORS-M-0R86-00','rosario-aquino-QC_VENDORS-M-0R86-0003','rosario.aquino.QC_VENDORS-M-0R86-0003@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.384','2026-05-13 15:57:32.384',NULL,NULL);
INSERT INTO `users` VALUES (53,4,'QC_VENDORS-M-S7G8-00','manuel-mercado-QC_VENDORS-M-S7G8-0004','manuel.mercado.QC_VENDORS-M-S7G8-0004@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.386','2026-05-13 15:57:32.386',NULL,NULL);
INSERT INTO `users` VALUES (54,4,'QC_VENDORS-M-QEZW-00','rowena-ramos-QC_VENDORS-M-QEZW-0005','rowena.ramos.QC_VENDORS-M-QEZW-0005@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.388','2026-05-13 15:57:32.388',NULL,NULL);
INSERT INTO `users` VALUES (55,4,'QC_VENDORS-M-99TE-00','carmen-gonzales-QC_VENDORS-M-99TE-0006','carmen.gonzales.QC_VENDORS-M-99TE-0006@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.391','2026-05-13 15:57:32.391',NULL,NULL);
INSERT INTO `users` VALUES (56,4,'QC_VENDORS-M-VVNZ-00','emilio-santos-QC_VENDORS-M-VVNZ-0007','emilio.santos.QC_VENDORS-M-VVNZ-0007@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.394','2026-05-13 15:57:32.394',NULL,NULL);
INSERT INTO `users` VALUES (57,4,'QC_VENDORS-M-P4GR-00','victoria-torres-QC_VENDORS-M-P4GR-0008','victoria.torres.QC_VENDORS-M-P4GR-0008@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.397','2026-05-13 15:57:32.397',NULL,NULL);
INSERT INTO `users` VALUES (58,4,'QC_VENDORS-M-KW9K-00','andres-soriano-QC_VENDORS-M-KW9K-0009','andres.soriano.QC_VENDORS-M-KW9K-0009@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.400','2026-05-13 15:57:32.400',NULL,NULL);
INSERT INTO `users` VALUES (59,4,'QC_VENDORS-M-19K5-00','emilio-flores-QC_VENDORS-M-19K5-0010','emilio.flores.QC_VENDORS-M-19K5-0010@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.403','2026-05-13 15:57:32.403',NULL,NULL);
INSERT INTO `users` VALUES (60,4,'QC_VENDORS-M-G6MH-00','roberto-delacruz-QC_VENDORS-M-G6MH-0011','roberto.delacruz.QC_VENDORS-M-G6MH-0011@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.406','2026-05-13 15:57:32.406',NULL,NULL);
INSERT INTO `users` VALUES (61,4,'QC_VENDORS-M-9UQK-00','marites-valencia-QC_VENDORS-M-9UQK-0012','marites.valencia.QC_VENDORS-M-9UQK-0012@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.409','2026-05-13 15:57:32.409',NULL,NULL);
INSERT INTO `users` VALUES (62,4,'QC_VENDORS-M-J3NE-00','arturo-flores-QC_VENDORS-M-J3NE-0013','arturo.flores.QC_VENDORS-M-J3NE-0013@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.412','2026-05-13 15:57:32.412',NULL,NULL);
INSERT INTO `users` VALUES (63,4,'QC_VENDORS-M-P7LO-00','emilio-ramos-QC_VENDORS-M-P7LO-0014','emilio.ramos.QC_VENDORS-M-P7LO-0014@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.414','2026-05-13 15:57:32.414',NULL,NULL);
INSERT INTO `users` VALUES (64,4,'QC_VENDORS-M-611R-00','rafael-lopez-QC_VENDORS-M-611R-0015','rafael.lopez.QC_VENDORS-M-611R-0015@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.416','2026-05-13 15:57:32.416',NULL,NULL);
INSERT INTO `users` VALUES (65,5,'MAKATI_BUSINESS-O-5K','emilio-aquino-MAKATI_BUSINESS-O-5K7H-0001','emilio.aquino.MAKATI_BUSINESS-O-5K7H-0001@gmail.com',NULL,'$2b$10$DIz3z1S0EYeyyke96C4kx.tD9cOjXUnylXIwoVkbZU81UbEloUf8a','operator','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.488','2026-05-13 15:57:32.488',NULL,NULL);
INSERT INTO `users` VALUES (66,5,'MAKATI_BUSINESS-M-K8','rowena-flores-MAKATI_BUSINESS-M-K8ZC-0001','rowena.flores.MAKATI_BUSINESS-M-K8ZC-0001@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.495','2026-05-13 15:57:32.495',NULL,NULL);
INSERT INTO `users` VALUES (67,5,'MAKATI_BUSINESS-M-XM','ricardo-salazar-MAKATI_BUSINESS-M-XM0G-0002','ricardo.salazar.MAKATI_BUSINESS-M-XM0G-0002@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.499','2026-05-13 15:57:32.499',NULL,NULL);
INSERT INTO `users` VALUES (68,5,'MAKATI_BUSINESS-M-IJ','ricardo-garcia-MAKATI_BUSINESS-M-IJ39-0003','ricardo.garcia.MAKATI_BUSINESS-M-IJ39-0003@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.505','2026-05-13 15:57:32.505',NULL,NULL);
INSERT INTO `users` VALUES (69,5,'MAKATI_BUSINESS-M-X8','merlinda-navarro-MAKATI_BUSINESS-M-X8GA-0004','merlinda.navarro.MAKATI_BUSINESS-M-X8GA-0004@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.511','2026-05-13 15:57:32.511',NULL,NULL);
INSERT INTO `users` VALUES (70,5,'MAKATI_BUSINESS-M-JF','rafael-torres-MAKATI_BUSINESS-M-JF9D-0005','rafael.torres.MAKATI_BUSINESS-M-JF9D-0005@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.517','2026-05-13 15:57:32.517',NULL,NULL);
INSERT INTO `users` VALUES (71,5,'MAKATI_BUSINESS-M-WU','ricardo-mercado-MAKATI_BUSINESS-M-WUCY-0006','ricardo.mercado.MAKATI_BUSINESS-M-WUCY-0006@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.522','2026-05-13 15:57:32.522',NULL,NULL);
INSERT INTO `users` VALUES (72,5,'MAKATI_BUSINESS-M-GU','jocelyn-mendoza-MAKATI_BUSINESS-M-GUO5-0007','jocelyn.mendoza.MAKATI_BUSINESS-M-GUO5-0007@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.527','2026-05-13 15:57:32.527',NULL,NULL);
INSERT INTO `users` VALUES (73,5,'MAKATI_BUSINESS-M-L1','corazon-rivera-MAKATI_BUSINESS-M-L1FJ-0008','corazon.rivera.MAKATI_BUSINESS-M-L1FJ-0008@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.531','2026-05-13 15:57:32.531',NULL,NULL);
INSERT INTO `users` VALUES (74,5,'MAKATI_BUSINESS-M-66','merlinda-aquino-MAKATI_BUSINESS-M-66UP-0009','merlinda.aquino.MAKATI_BUSINESS-M-66UP-0009@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.537','2026-05-13 15:57:32.537',NULL,NULL);
INSERT INTO `users` VALUES (75,5,'MAKATI_BUSINESS-M-44','rafael-cruz-MAKATI_BUSINESS-M-44I3-0010','rafael.cruz.MAKATI_BUSINESS-M-44I3-0010@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.541','2026-05-13 15:57:32.541',NULL,NULL);
INSERT INTO `users` VALUES (76,5,'MAKATI_BUSINESS-M-J5','miguel-ramos-MAKATI_BUSINESS-M-J5QM-0011','miguel.ramos.MAKATI_BUSINESS-M-J5QM-0011@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.545','2026-05-13 15:57:32.545',NULL,NULL);
INSERT INTO `users` VALUES (77,5,'MAKATI_BUSINESS-M-94','esperanza-salazar-MAKATI_BUSINESS-M-94V8-0012','esperanza.salazar.MAKATI_BUSINESS-M-94V8-0012@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.549','2026-05-13 15:57:32.549',NULL,NULL);
INSERT INTO `users` VALUES (78,5,'MAKATI_BUSINESS-M-KU','rafael-castillo-MAKATI_BUSINESS-M-KU7X-0013','rafael.castillo.MAKATI_BUSINESS-M-KU7X-0013@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.554','2026-05-13 15:57:32.554',NULL,NULL);
INSERT INTO `users` VALUES (79,5,'MAKATI_BUSINESS-M-Y2','rolando-villanueva-MAKATI_BUSINESS-M-Y2RD-0014','rolando.villanueva.MAKATI_BUSINESS-M-Y2RD-0014@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.558','2026-05-13 15:57:32.558',NULL,NULL);
INSERT INTO `users` VALUES (80,5,'MAKATI_BUSINESS-M-G3','jocelyn-soriano-MAKATI_BUSINESS-M-G3E8-0015','jocelyn.soriano.MAKATI_BUSINESS-M-G3E8-0015@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.563','2026-05-13 15:57:32.563',NULL,NULL);
INSERT INTO `users` VALUES (81,5,'MAKATI_BUSINESS-M-SL','merlinda-aquino-MAKATI_BUSINESS-M-SLAI-0016','merlinda.aquino.MAKATI_BUSINESS-M-SLAI-0016@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.568','2026-05-13 15:57:32.568',NULL,NULL);
INSERT INTO `users` VALUES (82,5,'MAKATI_BUSINESS-M-TP','cecilia-valencia-MAKATI_BUSINESS-M-TPKX-0017','cecilia.valencia.MAKATI_BUSINESS-M-TPKX-0017@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.573','2026-05-13 15:57:32.573',NULL,NULL);
INSERT INTO `users` VALUES (83,5,'MAKATI_BUSINESS-M-EP','victoria-gonzales-MAKATI_BUSINESS-M-EPRY-0018','victoria.gonzales.MAKATI_BUSINESS-M-EPRY-0018@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.577','2026-05-13 15:57:32.577',NULL,NULL);
INSERT INTO `users` VALUES (84,5,'MAKATI_BUSINESS-M-LL','esperanza-gonzales-MAKATI_BUSINESS-M-LLAF-0019','esperanza.gonzales.MAKATI_BUSINESS-M-LLAF-0019@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.581','2026-05-13 15:57:32.581',NULL,NULL);
INSERT INTO `users` VALUES (85,5,'MAKATI_BUSINESS-M-4R','luisa-reyes-MAKATI_BUSINESS-M-4RGW-0020','luisa.reyes.MAKATI_BUSINESS-M-4RGW-0020@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.586','2026-05-13 15:57:32.586',NULL,NULL);
INSERT INTO `users` VALUES (86,6,'CALAMBA_AGRI-O-YQAI-','cecilia-domingo-CALAMBA_AGRI-O-YQAI-0001','cecilia.domingo.CALAMBA_AGRI-O-YQAI-0001@gmail.com',NULL,'$2b$10$DIz3z1S0EYeyyke96C4kx.tD9cOjXUnylXIwoVkbZU81UbEloUf8a','operator','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.655','2026-05-13 15:57:32.655',NULL,NULL);
INSERT INTO `users` VALUES (87,6,'CALAMBA_AGRI-M-UJNM-','rafael-pascual-CALAMBA_AGRI-M-UJNM-0001','rafael.pascual.CALAMBA_AGRI-M-UJNM-0001@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.659','2026-05-13 15:57:32.659',NULL,NULL);
INSERT INTO `users` VALUES (88,6,'CALAMBA_AGRI-M-PK2M-','carmen-valencia-CALAMBA_AGRI-M-PK2M-0002','carmen.valencia.CALAMBA_AGRI-M-PK2M-0002@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.662','2026-05-13 15:57:32.662',NULL,NULL);
INSERT INTO `users` VALUES (89,6,'CALAMBA_AGRI-M-KIOJ-','ricardo-garcia-CALAMBA_AGRI-M-KIOJ-0003','ricardo.garcia.CALAMBA_AGRI-M-KIOJ-0003@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.666','2026-05-13 15:57:32.666',NULL,NULL);
INSERT INTO `users` VALUES (90,6,'CALAMBA_AGRI-M-TLSS-','rafael-navarro-CALAMBA_AGRI-M-TLSS-0004','rafael.navarro.CALAMBA_AGRI-M-TLSS-0004@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.669','2026-05-13 15:57:32.669',NULL,NULL);
INSERT INTO `users` VALUES (91,6,'CALAMBA_AGRI-M-EIRF-','patricia-castillo-CALAMBA_AGRI-M-EIRF-0005','patricia.castillo.CALAMBA_AGRI-M-EIRF-0005@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.674','2026-05-13 15:57:32.674',NULL,NULL);
INSERT INTO `users` VALUES (92,6,'CALAMBA_AGRI-M-9I5X-','maria-navarro-CALAMBA_AGRI-M-9I5X-0006','maria.navarro.CALAMBA_AGRI-M-9I5X-0006@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.681','2026-05-13 15:57:32.681',NULL,NULL);
INSERT INTO `users` VALUES (93,6,'CALAMBA_AGRI-M-SU2Q-','ramon-salazar-CALAMBA_AGRI-M-SU2Q-0007','ramon.salazar.CALAMBA_AGRI-M-SU2Q-0007@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.685','2026-05-13 15:57:32.685',NULL,NULL);
INSERT INTO `users` VALUES (94,6,'CALAMBA_AGRI-M-GU3K-','rolando-ramos-CALAMBA_AGRI-M-GU3K-0008','rolando.ramos.CALAMBA_AGRI-M-GU3K-0008@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.688','2026-05-13 15:57:32.688',NULL,NULL);
INSERT INTO `users` VALUES (95,6,'CALAMBA_AGRI-M-2J6D-','esperanza-bautista-CALAMBA_AGRI-M-2J6D-0009','esperanza.bautista.CALAMBA_AGRI-M-2J6D-0009@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.690','2026-05-13 15:57:32.690',NULL,NULL);
INSERT INTO `users` VALUES (96,6,'CALAMBA_AGRI-M-7E9V-','luisa-castillo-CALAMBA_AGRI-M-7E9V-0010','luisa.castillo.CALAMBA_AGRI-M-7E9V-0010@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.693','2026-05-13 15:57:32.693',NULL,NULL);
INSERT INTO `users` VALUES (97,6,'CALAMBA_AGRI-M-SNN8-','reynaldo-domingo-CALAMBA_AGRI-M-SNN8-0011','reynaldo.domingo.CALAMBA_AGRI-M-SNN8-0011@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.695','2026-05-13 15:57:32.695',NULL,NULL);
INSERT INTO `users` VALUES (98,6,'CALAMBA_AGRI-M-X0TP-','danilo-cruz-CALAMBA_AGRI-M-X0TP-0012','danilo.cruz.CALAMBA_AGRI-M-X0TP-0012@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.697','2026-05-13 15:57:32.697',NULL,NULL);
INSERT INTO `users` VALUES (99,6,'CALAMBA_AGRI-M-6EM5-','corazon-santos-CALAMBA_AGRI-M-6EM5-0013','corazon.santos.CALAMBA_AGRI-M-6EM5-0013@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.699','2026-05-13 15:57:32.699',NULL,NULL);
INSERT INTO `users` VALUES (100,6,'CALAMBA_AGRI-M-8YFI-','teresa-zamora-CALAMBA_AGRI-M-8YFI-0014','teresa.zamora.CALAMBA_AGRI-M-8YFI-0014@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.702','2026-05-13 15:57:32.702',NULL,NULL);
INSERT INTO `users` VALUES (101,6,'CALAMBA_AGRI-M-STFJ-','rolando-navarro-CALAMBA_AGRI-M-STFJ-0015','rolando.navarro.CALAMBA_AGRI-M-STFJ-0015@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.704','2026-05-13 15:57:32.704',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `user_profiles`
--

LOCK TABLES `user_profiles` WRITE;
/*!40000 ALTER TABLE `user_profiles` DISABLE KEYS */;
INSERT INTO `user_profiles` VALUES (1,1,1,'James',NULL,'Bryant',NULL,NULL,NULL,NULL,'single',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (2,2,2,'Fernando',NULL,'Aquino','male',NULL,'Brgy. Macabling, Malolos Market Vendors Cooperative',NULL,'single','Cooperative Operator',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (3,3,2,'Eduardo',NULL,'Navarro','male',NULL,'52 Rizal St, Brgy. Mandurriao','Sampaguita Store','single','Ukay-Ukay Vendor',NULL,'658-279-867',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (4,4,2,'Angelica',NULL,'Bautista','female',NULL,'59 Rizal St, Brgy. Mandurriao','Lucky 7 Sari-Sari','single','Freelancer',NULL,'177-104-784',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (5,5,2,'Ernesto',NULL,'Navarro','male',NULL,'98 Rizal St, Brgy. Mandurriao','Isdaan Fish Trading','single','Sari-Sari Store Owner',NULL,'399-233-65',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (6,6,2,'Eduardo',NULL,'Valencia','male',NULL,'66 Rizal St, Brgy. San Nicolas','Kabayan Grocery','single','Carinderia Owner',NULL,'886-274-431',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (7,7,2,'Fernando',NULL,'Soriano','male',NULL,'71 Rizal St, Brgy. Macabling','Taho Master PH','single','Tricycle Driver',NULL,'431-752-909',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (8,8,2,'Cecilia',NULL,'Pascual','female',NULL,'37 Rizal St, Brgy. Macabling','Tindahan ni Nanay','single','Rice Trader',NULL,'496-410-31',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (9,9,2,'Lourdes',NULL,'Gonzales','female',NULL,'5 Rizal St, Brgy. Macabling','J&R Trading','single','Freelancer',NULL,'618-807-741',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (10,10,2,'Gloria',NULL,'Pascual','female',NULL,'59 Rizal St, Brgy. Commonwealth','Buko King Enterprise','single','Laundry Service',NULL,'919-991-270',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (11,11,2,'Carlos',NULL,'Ramos','male',NULL,'91 Rizal St, Brgy. Sto. Domingo','Isdaan Fish Trading','single','Street Food Vendor',NULL,'512-339-817',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (12,12,2,'Carmen',NULL,'Domingo','female',NULL,'62 Rizal St, Brgy. Macabling','Ate Rose Mini Mart','single','Water Refilling Operator',NULL,'262-431-217',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (13,13,2,'Remedios',NULL,'Reyes','female',NULL,'76 Rizal St, Brgy. Balibago','Lutong Bahay Catering','single','Ukay-Ukay Vendor',NULL,'437-596-696',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (14,14,2,'Ricardo',NULL,'Mercado','male',NULL,'25 Rizal St, Brgy. Balibago','J&R Trading','single','Market Vendor',NULL,'266-870-61',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (15,15,2,'Ligaya',NULL,'Torres','female',NULL,'33 Rizal St, Brgy. Sto. Domingo','Golden Star Variety','single','Fish Vendor',NULL,'474-402-326',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (16,16,2,'Rolando',NULL,'Mercado','male',NULL,'14 Rizal St, Brgy. Jaro','Ate Rose Mini Mart','single','Water Refilling Operator',NULL,'294-665-136',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (17,17,2,'Merlinda',NULL,'Villanueva','female',NULL,'78 Rizal St, Brgy. Macabling','Kuya Eddie\'s General Mdse','single','Sari-Sari Store Owner',NULL,'624-167-184',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (18,18,2,'Ricardo',NULL,'Castillo','male',NULL,'85 Rizal St, Brgy. San Nicolas','Sampaguita Store','single','Market Vendor',NULL,'433-943-542',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (19,19,2,'Ricardo',NULL,'Reyes','male',NULL,'23 Rizal St, Brgy. Jaro','Palengke Express','single','Farmer',NULL,'457-382-68',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (20,20,2,'Remedios',NULL,'Valencia','female',NULL,'83 Rizal St, Brgy. Macabling','Kuya Eddie\'s General Mdse','single','Sari-Sari Store Owner',NULL,'900-843-165',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (21,21,2,'Jocelyn',NULL,'Navarro','female',NULL,'40 Rizal St, Brgy. Jaro','Panaderia De Manila','single','Ukay-Ukay Vendor',NULL,'758-502-122',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (22,22,2,'Lourdes',NULL,'Santos','female',NULL,'27 Rizal St, Brgy. Sto. Domingo','Ate Rose Mini Mart','single','Water Refilling Operator',NULL,'739-327-984',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (23,23,2,'Danilo',NULL,'Lopez','male',NULL,'89 Rizal St, Brgy. Sto. Domingo','Golden Star Variety','single','Freelancer',NULL,'403-489-817',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (24,24,3,'Jocelyn',NULL,'Garcia','female',NULL,'Brgy. San Nicolas, San Jose Rural Workers Coop',NULL,'single','Cooperative Operator',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (25,25,3,'Arturo',NULL,'Cruz','male',NULL,'23 Rizal St, Brgy. Mandurriao','Mabuhay Mart','single','Market Vendor',NULL,'380-117-882',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (26,26,3,'Carmen',NULL,'Pascual','female',NULL,'44 Rizal St, Brgy. Balibago','Panaderia De Manila','single','Ukay-Ukay Vendor',NULL,'950-693-941',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (27,27,3,'Luisa',NULL,'Soriano','female',NULL,'67 Rizal St, Brgy. Balibago','Isdaan Fish Trading','single','Water Refilling Operator',NULL,'497-727-332',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (28,28,3,'Maria',NULL,'Valencia','female',NULL,'46 Rizal St, Brgy. Mandurriao','Aling Nena\'s Sari-Sari','single','Carinderia Owner',NULL,'637-455-155',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (29,29,3,'Lourdes',NULL,'Garcia','female',NULL,'49 Rizal St, Brgy. Holy Spirit','Mabuhay Mart','single','Market Vendor',NULL,'214-963-55',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (30,30,3,'Rolando',NULL,'Salazar','male',NULL,'18 Rizal St, Brgy. Macabling','Lutong Bahay Catering','single','Ukay-Ukay Vendor',NULL,'483-830-900',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (31,31,3,'Elena',NULL,'Rivera','female',NULL,'70 Rizal St, Brgy. Holy Spirit','Tindahan ni Nanay','single','Market Vendor',NULL,'569-786-416',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (32,32,3,'Marites',NULL,'Reyes','female',NULL,'35 Rizal St, Brgy. Balibago','Kuya Eddie\'s General Mdse','single','Carinderia Owner',NULL,'142-914-295',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (33,33,3,'Roberto',NULL,'Villanueva','male',NULL,'18 Rizal St, Brgy. Holy Spirit','Kakanin Corner','single','Market Vendor',NULL,'325-770-286',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (34,34,3,'Ernesto',NULL,'Navarro','male',NULL,'63 Rizal St, Brgy. Jaro','J&R Trading','single','Rice Trader',NULL,'260-862-162',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (35,35,3,'Elena',NULL,'Garcia','female',NULL,'26 Rizal St, Brgy. Jaro','Aling Nena\'s Sari-Sari','single','Laundry Service',NULL,'480-272-869',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (36,36,3,'Rowena',NULL,'Santos','female',NULL,'63 Rizal St, Brgy. Balibago','Ate Rose Mini Mart','single','Sari-Sari Store Owner',NULL,'308-776-640',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (37,37,3,'Angelica',NULL,'Salazar','female',NULL,'71 Rizal St, Brgy. Jaro','Kakanin Corner','single','Fish Vendor',NULL,'659-489-881',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (38,38,3,'Emilio',NULL,'Rivera','male',NULL,'69 Rizal St, Brgy. San Nicolas','Kuya Eddie\'s General Mdse','single','Farmer',NULL,'351-626-329',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (39,39,3,'Eduardo',NULL,'Santos','male',NULL,'25 Rizal St, Brgy. Commonwealth','Lutong Bahay Catering','single','Farmer',NULL,'139-379-555',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (40,40,3,'Rolando',NULL,'Soriano','male',NULL,'33 Rizal St, Brgy. Commonwealth','Buko King Enterprise','single','Street Food Vendor',NULL,'837-946-32',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (41,41,3,'Angelica',NULL,'Bautista','female',NULL,'92 Rizal St, Brgy. Mandurriao','Tres Marias Store','single','Market Vendor',NULL,'902-946-993',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (42,42,3,'Marites',NULL,'Valencia','female',NULL,'54 Rizal St, Brgy. Sto. Domingo','Lutong Bahay Catering','single','Freelancer',NULL,'533-635-813',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (43,43,3,'Rolando',NULL,'Fernandez','male',NULL,'59 Rizal St, Brgy. San Nicolas','Palengke Express','single','Water Refilling Operator',NULL,'458-999-641',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (44,44,3,'Luisa',NULL,'Bautista','female',NULL,'9 Rizal St, Brgy. Commonwealth','Ate Rose Mini Mart','single','Water Refilling Operator',NULL,'588-754-526',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (45,45,3,'Danilo',NULL,'Torres','male',NULL,'73 Rizal St, Brgy. Jaro','Tindahan ni Nanay','single','Farmer',NULL,'941-513-461',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (46,46,3,'Rosario',NULL,'Aquino','female',NULL,'57 Rizal St, Brgy. Sto. Domingo','Kakanin Corner','single','Freelancer',NULL,'273-279-762',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (47,47,3,'Carlos',NULL,'Garcia','male',NULL,'20 Rizal St, Brgy. Mandurriao','Ate Rose Mini Mart','single','Tricycle Driver',NULL,'703-822-855',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (48,48,3,'Danilo',NULL,'Flores','male',NULL,'95 Rizal St, Brgy. Holy Spirit','Kuya Eddie\'s General Mdse','single','Water Refilling Operator',NULL,'937-411-476',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (49,49,4,'Danilo',NULL,'Gonzales','male',NULL,'Brgy. Sto. Domingo, Quezon City Vendors Trust',NULL,'single','Cooperative Operator',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (50,50,4,'Fernando',NULL,'Valencia','male',NULL,'66 Rizal St, Brgy. Jaro','Mabuhay Mart','single','Tricycle Driver',NULL,'953-512-417',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (51,51,4,'Ligaya',NULL,'Villanueva','female',NULL,'58 Rizal St, Brgy. Holy Spirit','Taho Master PH','single','Farmer',NULL,'134-229-592',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (52,52,4,'Rosario',NULL,'Aquino','female',NULL,'64 Rizal St, Brgy. Macabling','Sampaguita Store','single','Laundry Service',NULL,'404-494-784',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (53,53,4,'Manuel',NULL,'Mercado','male',NULL,'5 Rizal St, Brgy. Mandurriao','Ate Rose Mini Mart','single','Water Refilling Operator',NULL,'843-564-682',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (54,54,4,'Rowena',NULL,'Ramos','female',NULL,'63 Rizal St, Brgy. Sto. Domingo','Kuya Eddie\'s General Mdse','single','Water Refilling Operator',NULL,'627-506-599',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (55,55,4,'Carmen',NULL,'Gonzales','female',NULL,'61 Rizal St, Brgy. Sto. Domingo','Sampaguita Store','single','Street Food Vendor',NULL,'771-318-644',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (56,56,4,'Emilio',NULL,'Santos','male',NULL,'75 Rizal St, Brgy. Commonwealth','Taho Master PH','single','Water Refilling Operator',NULL,'877-618-869',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (57,57,4,'Victoria',NULL,'Torres','female',NULL,'74 Rizal St, Brgy. Sto. Domingo','Tindahan ni Nanay','single','Tricycle Driver',NULL,'413-644-808',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (58,58,4,'Andres',NULL,'Soriano','male',NULL,'2 Rizal St, Brgy. Jaro','Lutong Bahay Catering','single','Water Refilling Operator',NULL,'600-766-40',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (59,59,4,'Emilio',NULL,'Flores','male',NULL,'24 Rizal St, Brgy. Batasan Hills','Kabayan Grocery','single','Laundry Service',NULL,'996-775-263',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (60,60,4,'Roberto',NULL,'Dela Cruz','male',NULL,'25 Rizal St, Brgy. Sto. Domingo','Lucky 7 Sari-Sari','single','Freelancer',NULL,'593-460-103',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (61,61,4,'Marites',NULL,'Valencia','female',NULL,'5 Rizal St, Brgy. Balibago','Tindahan ni Nanay','single','Street Food Vendor',NULL,'479-580-256',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (62,62,4,'Arturo',NULL,'Flores','male',NULL,'30 Rizal St, Brgy. Jaro','Panaderia De Manila','single','Farmer',NULL,'895-447-378',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (63,63,4,'Emilio',NULL,'Ramos','male',NULL,'65 Rizal St, Brgy. Jaro','Buko King Enterprise','single','Carinderia Owner',NULL,'578-776-291',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (64,64,4,'Rafael',NULL,'Lopez','male',NULL,'14 Rizal St, Brgy. Balibago','Panaderia De Manila','single','Fish Vendor',NULL,'955-329-155',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (65,65,5,'Emilio',NULL,'Aquino','male',NULL,'Brgy. Commonwealth, Makati Business Sari-Sari Coop',NULL,'single','Cooperative Operator',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (66,66,5,'Rowena',NULL,'Flores','female',NULL,'13 Rizal St, Brgy. Holy Spirit','J&R Trading','single','Sari-Sari Store Owner',NULL,'335-466-507',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (67,67,5,'Ricardo',NULL,'Salazar','male',NULL,'25 Rizal St, Brgy. Balibago','Tres Marias Store','single','Tricycle Driver',NULL,'950-486-992',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (68,68,5,'Ricardo',NULL,'Garcia','male',NULL,'92 Rizal St, Brgy. Sto. Domingo','Kuya Eddie\'s General Mdse','single','Sari-Sari Store Owner',NULL,'234-851-953',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (69,69,5,'Merlinda',NULL,'Navarro','female',NULL,'20 Rizal St, Brgy. Sto. Domingo','Kakanin Corner','single','Rice Trader',NULL,'646-342-258',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (70,70,5,'Rafael',NULL,'Torres','male',NULL,'37 Rizal St, Brgy. San Nicolas','Buko King Enterprise','single','Street Food Vendor',NULL,'656-132-139',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (71,71,5,'Ricardo',NULL,'Mercado','male',NULL,'5 Rizal St, Brgy. Mandurriao','Sampaguita Store','single','Sari-Sari Store Owner',NULL,'352-556-528',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (72,72,5,'Jocelyn',NULL,'Mendoza','female',NULL,'10 Rizal St, Brgy. Holy Spirit','Lucky 7 Sari-Sari','single','Ukay-Ukay Vendor',NULL,'610-562-569',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (73,73,5,'Corazon',NULL,'Rivera','female',NULL,'46 Rizal St, Brgy. Jaro','Kuya Eddie\'s General Mdse','single','Freelancer',NULL,'319-373-859',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (74,74,5,'Merlinda',NULL,'Aquino','female',NULL,'16 Rizal St, Brgy. Commonwealth','Kabayan Grocery','single','Market Vendor',NULL,'893-464-183',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (75,75,5,'Rafael',NULL,'Cruz','male',NULL,'42 Rizal St, Brgy. Mandurriao','Palengke Express','single','Street Food Vendor',NULL,'382-792-416',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (76,76,5,'Miguel',NULL,'Ramos','male',NULL,'20 Rizal St, Brgy. San Nicolas','Lucky 7 Sari-Sari','single','Fish Vendor',NULL,'280-705-520',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (77,77,5,'Esperanza',NULL,'Salazar','female',NULL,'50 Rizal St, Brgy. Batasan Hills','Kakanin Corner','single','Freelancer',NULL,'169-852-313',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (78,78,5,'Rafael',NULL,'Castillo','male',NULL,'60 Rizal St, Brgy. Jaro','Tiangge ni Mang Bert','single','Fish Vendor',NULL,'975-575-120',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (79,79,5,'Rolando',NULL,'Villanueva','male',NULL,'100 Rizal St, Brgy. Macabling','Lucky 7 Sari-Sari','single','Water Refilling Operator',NULL,'541-572-326',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (80,80,5,'Jocelyn',NULL,'Soriano','female',NULL,'10 Rizal St, Brgy. Holy Spirit','Tindahan ni Nanay','single','Laundry Service',NULL,'108-571-710',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (81,81,5,'Merlinda',NULL,'Aquino','female',NULL,'89 Rizal St, Brgy. Batasan Hills','Mabuhay Mart','single','Sari-Sari Store Owner',NULL,'586-193-890',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (82,82,5,'Cecilia',NULL,'Valencia','female',NULL,'48 Rizal St, Brgy. Sto. Domingo','Ate Rose Mini Mart','single','Freelancer',NULL,'242-798-539',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (83,83,5,'Victoria',NULL,'Gonzales','female',NULL,'35 Rizal St, Brgy. Batasan Hills','Aling Nena\'s Sari-Sari','single','Freelancer',NULL,'791-352-802',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (84,84,5,'Esperanza',NULL,'Gonzales','female',NULL,'57 Rizal St, Brgy. San Nicolas','Kuya Eddie\'s General Mdse','single','Market Vendor',NULL,'170-103-397',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (85,85,5,'Luisa',NULL,'Reyes','female',NULL,'17 Rizal St, Brgy. Mandurriao','Buko King Enterprise','single','Sari-Sari Store Owner',NULL,'867-383-244',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (86,86,6,'Cecilia',NULL,'Domingo','female',NULL,'Brgy. Holy Spirit, Calamba Agricultural Cooperative',NULL,'single','Cooperative Operator',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (87,87,6,'Rafael',NULL,'Pascual','male',NULL,'53 Rizal St, Brgy. Sto. Domingo','J&R Trading','single','Tricycle Driver',NULL,'581-364-471',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (88,88,6,'Carmen',NULL,'Valencia','female',NULL,'27 Rizal St, Brgy. Holy Spirit','Panaderia De Manila','single','Freelancer',NULL,'847-758-133',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (89,89,6,'Ricardo',NULL,'Garcia','male',NULL,'48 Rizal St, Brgy. Commonwealth','Mabuhay Mart','single','Water Refilling Operator',NULL,'404-698-577',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (90,90,6,'Rafael',NULL,'Navarro','male',NULL,'63 Rizal St, Brgy. Batasan Hills','Panaderia De Manila','single','Tricycle Driver',NULL,'679-802-723',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (91,91,6,'Patricia',NULL,'Castillo','female',NULL,'16 Rizal St, Brgy. Balibago','J&R Trading','single','Street Food Vendor',NULL,'959-724-213',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (92,92,6,'Maria',NULL,'Navarro','female',NULL,'37 Rizal St, Brgy. Mandurriao','Palengke Express','single','Ukay-Ukay Vendor',NULL,'888-113-235',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (93,93,6,'Ramon',NULL,'Salazar','male',NULL,'96 Rizal St, Brgy. Macabling','Bahay Kubo Trading','single','Sari-Sari Store Owner',NULL,'394-718-298',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (94,94,6,'Rolando',NULL,'Ramos','male',NULL,'92 Rizal St, Brgy. Mandurriao','Mabuhay Mart','single','Water Refilling Operator',NULL,'415-261-464',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (95,95,6,'Esperanza',NULL,'Bautista','female',NULL,'58 Rizal St, Brgy. Holy Spirit','Ate Rose Mini Mart','single','Farmer',NULL,'134-696-784',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (96,96,6,'Luisa',NULL,'Castillo','female',NULL,'32 Rizal St, Brgy. Sto. Domingo','Mabuhay Mart','single','Street Food Vendor',NULL,'685-186-599',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (97,97,6,'Reynaldo',NULL,'Domingo','male',NULL,'57 Rizal St, Brgy. Balibago','Sampaguita Store','single','Sari-Sari Store Owner',NULL,'510-738-585',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (98,98,6,'Danilo',NULL,'Cruz','male',NULL,'3 Rizal St, Brgy. Batasan Hills','Bahay Kubo Trading','single','Sari-Sari Store Owner',NULL,'387-335-56',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (99,99,6,'Corazon',NULL,'Santos','female',NULL,'87 Rizal St, Brgy. Balibago','Kuya Eddie\'s General Mdse','single','Street Food Vendor',NULL,'727-743-583',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (100,100,6,'Teresa',NULL,'Zamora','female',NULL,'86 Rizal St, Brgy. Jaro','Golden Star Variety','single','Laundry Service',NULL,'196-258-443',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (101,101,6,'Rolando',NULL,'Navarro','male',NULL,'20 Rizal St, Brgy. Balibago','Lutong Bahay Catering','single','Market Vendor',NULL,'809-331-562',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `user_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `savings_accounts`
--

LOCK TABLES `savings_accounts` WRITE;
/*!40000 ALTER TABLE `savings_accounts` DISABLE KEYS */;
INSERT INTO `savings_accounts` VALUES (1,1,1,'regular_savings','superadmin',0.00,0,NULL,'2026-05-14 10:45:26.000','2026-05-14 10:45:26.000');
/*!40000 ALTER TABLE `savings_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `two_factor_auth`
--

LOCK TABLES `two_factor_auth` WRITE;
/*!40000 ALTER TABLE `two_factor_auth` DISABLE KEYS */;
/*!40000 ALTER TABLE `two_factor_auth` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `ledger_accounts`
--

LOCK TABLES `ledger_accounts` WRITE;
/*!40000 ALTER TABLE `ledger_accounts` DISABLE KEYS */;
INSERT INTO `ledger_accounts` VALUES (1,'Cash and Cash Equivalents','CASH_EQUIVALENTS','ASSET',NULL,1,'2026-05-13 15:57:31.942','2026-05-13 15:57:31.942');
INSERT INTO `ledger_accounts` VALUES (2,'Member Savings Deposits','MEMBER_SAVINGS','LIABILITY',NULL,1,'2026-05-13 15:57:31.955','2026-05-13 15:57:31.955');
INSERT INTO `ledger_accounts` VALUES (3,'Loan Receivables','LOAN_RECEIVABLES','ASSET',NULL,1,'2026-05-13 15:57:31.962','2026-05-13 15:57:31.962');
INSERT INTO `ledger_accounts` VALUES (4,'Interest Income','INTEREST_INCOME','REVENUE',NULL,1,'2026-05-13 15:57:31.968','2026-05-13 15:57:31.968');
INSERT INTO `ledger_accounts` VALUES (5,'Reconciliation Discrepancy','RECONC_DISCREPANCY','EXPENSE',NULL,1,'2026-05-13 15:57:31.975','2026-05-13 15:57:31.975');
/*!40000 ALTER TABLE `ledger_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `business_ledger`
--

LOCK TABLES `business_ledger` WRITE;
/*!40000 ALTER TABLE `business_ledger` DISABLE KEYS */;
/*!40000 ALTER TABLE `business_ledger` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `platform_config`
--

LOCK TABLES `platform_config` WRITE;
/*!40000 ALTER TABLE `platform_config` DISABLE KEYS */;
/*!40000 ALTER TABLE `platform_config` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-14 11:34:21
