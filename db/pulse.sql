-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 08, 2025 at 06:31 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pulse`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `appointment_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `slot_id` int(11) NOT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `status` enum('Scheduled','Completed','Cancelled') NOT NULL DEFAULT 'Scheduled',
  `prescription_file_path` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `appointment_slots`
--

CREATE TABLE `appointment_slots` (
  `slot_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `clinic_id` int(11) NOT NULL,
  `slot_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `is_booked` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `appointment_slots`
--

INSERT INTO `appointment_slots` (`slot_id`, `doctor_id`, `clinic_id`, `slot_date`, `start_time`, `end_time`, `is_booked`) VALUES
(1, 1, 1, '2025-04-29', '09:00:00', '10:00:00', 0),
(2, 1, 1, '2025-04-29', '10:00:00', '11:00:00', 0),
(3, 1, 1, '2025-04-29', '11:00:00', '12:00:00', 0),
(4, 1, 1, '2025-04-29', '13:00:00', '14:00:00', 0),
(5, 1, 1, '2025-04-29', '14:00:00', '15:00:00', 0),
(6, 1, 1, '2025-04-30', '09:00:00', '10:00:00', 0),
(7, 1, 1, '2025-04-30', '10:00:00', '11:00:00', 0),
(8, 1, 1, '2025-04-30', '11:00:00', '12:00:00', 0),
(9, 1, 1, '2025-04-30', '13:00:00', '14:00:00', 0),
(10, 1, 1, '2025-04-30', '14:00:00', '15:00:00', 0),
(11, 1, 1, '2025-05-01', '09:00:00', '10:00:00', 0),
(12, 1, 1, '2025-05-01', '10:00:00', '11:00:00', 0),
(13, 1, 1, '2025-05-01', '11:00:00', '12:00:00', 0),
(14, 1, 1, '2025-05-01', '13:00:00', '14:00:00', 0),
(15, 1, 1, '2025-05-01', '14:00:00', '15:00:00', 0),
(16, 1, 1, '2025-05-02', '09:00:00', '10:00:00', 0),
(17, 1, 1, '2025-05-02', '10:00:00', '11:00:00', 0),
(18, 1, 1, '2025-05-02', '11:00:00', '12:00:00', 0),
(19, 1, 1, '2025-05-02', '13:00:00', '14:00:00', 0),
(20, 1, 1, '2025-05-02', '14:00:00', '15:00:00', 0),
(21, 1, 1, '2025-05-03', '09:00:00', '10:00:00', 0),
(22, 1, 1, '2025-05-03', '10:00:00', '11:00:00', 0),
(23, 1, 1, '2025-05-03', '11:00:00', '12:00:00', 0),
(24, 1, 1, '2025-05-03', '13:00:00', '14:00:00', 0),
(25, 1, 1, '2025-05-03', '14:00:00', '15:00:00', 0),
(26, 1, 1, '2025-05-04', '09:00:00', '10:00:00', 0),
(27, 1, 1, '2025-05-04', '10:00:00', '11:00:00', 0),
(28, 1, 1, '2025-05-04', '11:00:00', '12:00:00', 0),
(29, 1, 1, '2025-05-04', '13:00:00', '14:00:00', 0),
(30, 1, 1, '2025-05-04', '14:00:00', '15:00:00', 0),
(31, 1, 1, '2025-05-05', '09:00:00', '10:00:00', 0),
(32, 1, 1, '2025-05-05', '10:00:00', '11:00:00', 0),
(33, 1, 1, '2025-05-05', '11:00:00', '12:00:00', 0),
(34, 1, 1, '2025-05-05', '13:00:00', '14:00:00', 0),
(35, 1, 1, '2025-05-05', '14:00:00', '15:00:00', 0);

-- --------------------------------------------------------

--
-- Table structure for table `chat_history`
--

CREATE TABLE `chat_history` (
  `chat_history_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` varchar(50) NOT NULL,
  `content` text DEFAULT NULL,
  `tool_calls` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tool_calls`)),
  `tool_call_id` varchar(255) DEFAULT NULL,
  `function_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chat_history`
--

INSERT INTO `chat_history` (`chat_history_id`, `user_id`, `role`, `content`, `tool_calls`, `tool_call_id`, `function_name`) VALUES
(1, 278, 'user', 'Hello', NULL, NULL, NULL),
(2, 278, 'assistant', 'Hello! How can I assist you today?', NULL, NULL, NULL),
(3, 278, 'user', 'I am feeling pain in my chest', NULL, NULL, NULL),
(4, 278, 'assistant', 'I\'m sorry to hear that you\'re experiencing chest pain. Chest pain can have various causes, ranging from minor issues (like muscle strains) to more serious conditions (such as heart problems or lung issues). It\'s crucial to take chest pain seriously, especially if it\'s accompanied by any of the following:\n\n- Shortness of breath\n- Pressure or tightness in the chest\n- Pain radiating to the arms, neck, or jaw\n- Nausea or vomiting\n- Sweating or dizziness\n- An irregular or rapid heartbeat\n\n**What should you do?**\nIf your chest pain is severe, lasts more than a few minutes, or you have any of the symptoms listed above, you should seek emergency medical attention immediately by calling emergency services.\n\nIf your pain is mild and you\'d like to consult a doctor, I can help you find a nearby doctor or cardiologist and check for available appointment slots. Let me know how you\'d like to proceed.', NULL, NULL, NULL),
(5, 278, 'user', 'find me a doctor for my situation', NULL, NULL, NULL),
(6, 278, 'assistant', NULL, '[{\"id\": \"call_XNmosq4Git90yjqnmnwj48D0\", \"type\": \"function\", \"index\": 0, \"function\": {\"name\": \"get_from_db\", \"arguments\": \"{\\\"query\\\":\\\"SELECT doctors.doctor_id, doctors.first_name, doctors.last_name, specialties.specialty_name, doctors.bio, doctors.phone, doctors.consultation_fee FROM doctors JOIN specialties ON doctors.specialty_id = specialties.specialty_id WHERE specialties.specialty_name LIKE \'%Cardiologist%\' OR specialties.specialty_name LIKE \'%Emergency Medicine%\' LIMIT 5;\\\"}\"}}]', NULL, NULL),
(7, 278, 'tool', 'Query executed successfully.\nResult:\n[\n  {\n    \"doctor_id\": 24,\n    \"first_name\": \"Sonal\",\n    \"last_name\": \"Jani\",\n    \"specialty_name\": \"Cardiologist\",\n    \"bio\": null,\n    \"phone\": null,\n    \"consultation_fee\": null\n  },\n  {\n    \"doctor_id\": 25,\n    \"first_name\": \"Kenneth\",\n    \"last_name\": \"Giedd\",\n    \"specialty_name\": \"Cardiologist\",\n    \"bio\": null,\n    \"phone\": null,\n    \"consultation_fee\": null\n  },\n  {\n    \"doctor_id\": 26,\n    \"first_name\": \"Azadeh\",\n    \"last_name\": \"Beheshtian\",\n    \"specialty_name\": \"Cardiologist\",\n    \"bio\": null,\n    \"phone\": null,\n    \"consultation_fee\": null\n  },\n  {\n    \"doctor_id\": 53,\n    \"first_name\": \"Jason\",\n    \"last_name\": \"Deutsch\",\n    \"specialty_name\": \"Emergency Medicine Physician\",\n    \"bio\": null,\n    \"phone\": null,\n    \"consultation_fee\": null\n  },\n  {\n    \"doctor_id\": 54,\n    \"first_name\": \"Daniel\",\n    \"last_name\": \"Wank\",\n    \"specialty_name\": \"Emergency Medicine Physician\",\n    \"bio\": null,\n    \"phone\": null,\n    \"consultation_fee\": null\n  }\n]', NULL, 'call_XNmosq4Git90yjqnmnwj48D0', 'get_from_db'),
(8, 278, 'assistant', 'I\'ve found the following doctors specializing in cardiology and emergency medicine. Here are their details:\n\n### Cardiologists:\n1. **Dr. Sonal Jani**  \n2. **Dr. Kenneth Giedd**  \n3. **Dr. Azadeh Beheshtian**\n\n### Emergency Medicine Physicians:\n4. **Dr. Jason Deutsch**  \n5. **Dr. Daniel Wank**\n\nIf you\'d like, I can help you check their availability, clinic locations, or assist in booking an appointment. Let me know what you\'d prefer.', NULL, NULL, NULL),
(9, 278, 'user', 'What clinics work with you?', NULL, NULL, NULL),
(10, 278, 'assistant', NULL, '[{\"id\": \"call_KhcwzpUt0RkeKqegE5fl86GY\", \"type\": \"function\", \"index\": 0, \"function\": {\"name\": \"get_from_db\", \"arguments\": \"{\\\"query\\\":\\\"SELECT name, address, phone, email FROM clinics LIMIT 10;\\\"}\"}}]', NULL, NULL),
(11, 278, 'tool', 'Query executed successfully.\nResult:\n[\n  {\n    \"name\": \"Verdun Clinic\",\n    \"address\": \"Verdun, Beirut\",\n    \"phone\": \"01 807 228\",\n    \"email\": \"verdunclinic@test.com\"\n  },\n  {\n    \"name\": \"Verdun Clinic\",\n    \"address\": \"Verdun, Beirut\",\n    \"phone\": \"01807228\",\n    \"email\": \"verdunclinic@test.com\"\n  }\n]', NULL, 'call_KhcwzpUt0RkeKqegE5fl86GY', 'get_from_db'),
(12, 278, 'assistant', 'Here are the clinics we work with:\n\n1. **Verdun Clinic**  \n   - Address: Verdun, Beirut  \n   - Phone: 01 807 228  \n   - Email: verdunclinic@test.com  \n\nWould you like to know more about this clinic or check available appointments with doctors there?', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `clinics`
--

CREATE TABLE `clinics` (
  `clinic_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clinics`
--

INSERT INTO `clinics` (`clinic_id`, `name`, `address`, `phone`, `email`, `description`, `logo`) VALUES
(1, 'Verdun Clinic', 'Verdun, Beirut', '01 807 228', 'verdunclinic@test.com', 'Medical Clinic', '/images/601803c0-02c1-42fe-a7a8-1a65cbd1fdfd'),
(2, 'Verdun Clinic', 'Verdun, Beirut', '01807228', 'verdunclinic@test.com', 'A clinic in verdun', '/images/e3e44a0c-a09f-46f2-bb72-5cc7b2e53362');

-- --------------------------------------------------------

--
-- Table structure for table `clinic_calendar`
--

CREATE TABLE `clinic_calendar` (
  `schedule_id` int(11) NOT NULL,
  `clinic_id` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `is_open` tinyint(1) NOT NULL DEFAULT 1,
  `opening_time` time DEFAULT NULL,
  `closing_time` time DEFAULT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clinic_calendar`
--

INSERT INTO `clinic_calendar` (`schedule_id`, `clinic_id`, `day_of_week`, `is_open`, `opening_time`, `closing_time`, `date`) VALUES
(1, 1, 'Monday', 1, '17:00:00', '22:00:00', '2025-05-12'),
(2, 1, 'Monday', 1, '12:47:00', '18:47:00', '2025-05-19'),
(3, 1, 'Monday', 1, '12:47:00', '18:47:00', '2025-05-26'),
(4, 1, 'Monday', 1, '12:47:00', '18:47:00', '2025-06-02'),
(5, 1, 'Wednesday', 1, '14:00:00', '17:00:00', '2025-05-07');

-- --------------------------------------------------------

--
-- Table structure for table `clinic_doctor`
--

CREATE TABLE `clinic_doctor` (
  `clinic_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clinic_doctor`
--

INSERT INTO `clinic_doctor` (`clinic_id`, `doctor_id`) VALUES
(1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

CREATE TABLE `doctors` (
  `doctor_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `gender` enum('Male','Female') DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `license_number` varchar(50) NOT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `qualifications` text DEFAULT NULL,
  `experience_years` int(11) DEFAULT NULL,
  `languages_spoken` varchar(255) DEFAULT NULL,
  `consultation_fee` decimal(10,2) DEFAULT NULL,
  `specialty_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `doctors`
--

INSERT INTO `doctors` (`doctor_id`, `user_id`, `first_name`, `last_name`, `gender`, `phone`, `license_number`, `profile_picture`, `bio`, `qualifications`, `experience_years`, `languages_spoken`, `consultation_fee`, `specialty_id`) VALUES
(1, 1, 'Diem', 'Truong', NULL, NULL, '0', NULL, NULL, NULL, NULL, NULL, NULL, 1),
(2, 2, 'Monique', 'Rivera', NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, 1),
(3, 3, 'Ronald', 'MSAc', NULL, NULL, '2', NULL, NULL, NULL, NULL, NULL, NULL, 1),
(4, 4, 'Natan', 'Schleider', NULL, NULL, '332', NULL, NULL, NULL, NULL, NULL, NULL, 2),
(5, 5, 'Natan', 'Schleider', NULL, NULL, '333', NULL, NULL, NULL, NULL, NULL, NULL, 2),
(6, 6, 'Natan', 'Schleider', NULL, NULL, '442', NULL, NULL, NULL, NULL, NULL, NULL, 2),
(7, 7, 'Lauren', 'Solomont', NULL, NULL, '295', NULL, NULL, NULL, NULL, NULL, NULL, 3),
(8, 8, 'Meulan', 'Amen', NULL, NULL, '321', NULL, NULL, NULL, NULL, NULL, NULL, 3),
(9, 9, 'Lauren', 'Solomont', NULL, NULL, '479', NULL, NULL, NULL, NULL, NULL, NULL, 3),
(10, 10, 'Sarah', 'Delaney', NULL, NULL, '2244', NULL, NULL, NULL, NULL, NULL, NULL, 4),
(11, 11, 'Jordana', 'Cotton', NULL, NULL, '2247', NULL, NULL, NULL, NULL, NULL, NULL, 4),
(12, 12, 'Ann', 'Green', NULL, NULL, '2252', NULL, NULL, NULL, NULL, NULL, NULL, 4),
(13, 13, 'Roshni', 'Naik', NULL, NULL, '200', NULL, NULL, NULL, NULL, NULL, NULL, 5),
(14, 14, 'Roshni', 'Naik', NULL, NULL, '201', NULL, NULL, NULL, NULL, NULL, NULL, 5),
(15, 15, 'Vahid', 'Rahimian', NULL, NULL, '202', NULL, NULL, NULL, NULL, NULL, NULL, 5),
(16, 16, 'Ramesh', 'Sawhney', NULL, NULL, '7897', NULL, NULL, NULL, NULL, NULL, NULL, 6),
(17, 17, 'Ramesh', 'Sawhney', NULL, NULL, '8185', NULL, NULL, NULL, NULL, NULL, NULL, 6),
(18, 18, 'Janie', 'Barnett', NULL, NULL, '390', NULL, NULL, NULL, NULL, NULL, NULL, 7),
(19, 19, 'Pouya', 'MA', NULL, NULL, '391', NULL, NULL, NULL, NULL, NULL, NULL, 7),
(20, 20, 'Pouya', 'MA', NULL, NULL, '392', NULL, NULL, NULL, NULL, NULL, NULL, 7),
(21, 21, 'Daniel', 'Wank', NULL, NULL, '1465', NULL, NULL, NULL, NULL, NULL, NULL, 8),
(22, 22, 'Sergey', 'Terushkin', NULL, NULL, '1480', NULL, NULL, NULL, NULL, NULL, NULL, 8),
(23, 23, 'Edward', 'Zoltan', NULL, NULL, '1504', NULL, NULL, NULL, NULL, NULL, NULL, 8),
(24, 24, 'Sonal', 'Jani', NULL, NULL, '580', NULL, NULL, NULL, NULL, NULL, NULL, 9),
(25, 25, 'Kenneth', 'Giedd', NULL, NULL, '581', NULL, NULL, NULL, NULL, NULL, NULL, 9),
(26, 26, 'Azadeh', 'Beheshtian', NULL, NULL, '582', NULL, NULL, NULL, NULL, NULL, NULL, 9),
(27, 27, 'Alexa', 'Lessow', NULL, NULL, '1482', NULL, NULL, NULL, NULL, NULL, NULL, 10),
(28, 28, 'Aykut', 'Ozden', NULL, NULL, '1492', NULL, NULL, NULL, NULL, NULL, NULL, 10),
(29, 29, 'Avi', 'Retter', NULL, NULL, '1544', NULL, NULL, NULL, NULL, NULL, NULL, 10),
(30, 30, 'Lev', 'Kalika', NULL, NULL, '110', NULL, NULL, NULL, NULL, NULL, NULL, 11),
(31, 31, 'Avi', 'Retter', NULL, NULL, '111', NULL, NULL, NULL, NULL, NULL, NULL, 11),
(32, 32, 'Kelly', 'BayCNS', NULL, NULL, '114', NULL, NULL, NULL, NULL, NULL, NULL, 11),
(33, 33, 'Artem', 'Kaplan', NULL, NULL, '8323', NULL, NULL, NULL, NULL, NULL, NULL, 12),
(34, 34, 'Margarita', 'Mikhaylova', NULL, NULL, '8331', NULL, NULL, NULL, NULL, NULL, NULL, 12),
(35, 35, 'Artem', 'Kaplan', NULL, NULL, '8342', NULL, NULL, NULL, NULL, NULL, NULL, 12),
(36, 36, 'Jose', 'Colon', NULL, NULL, '8668', NULL, NULL, NULL, NULL, NULL, NULL, 13),
(37, 37, 'Ami', 'Patel', NULL, NULL, '8669', NULL, NULL, NULL, NULL, NULL, NULL, 13),
(38, 38, 'Priti', 'Batta', NULL, NULL, '2075', NULL, NULL, NULL, NULL, NULL, NULL, 14),
(39, 39, 'Priti', 'Batta', NULL, NULL, '4887', NULL, NULL, NULL, NULL, NULL, NULL, 14),
(40, 40, 'Avi', 'Retter', NULL, NULL, '980', NULL, NULL, NULL, NULL, NULL, NULL, 15),
(41, 41, 'D.', 'Culotta', NULL, NULL, '981', NULL, NULL, NULL, NULL, NULL, NULL, 15),
(42, 42, 'Oleg', 'Goncharov', NULL, NULL, '982', NULL, NULL, NULL, NULL, NULL, NULL, 15),
(43, 43, 'Sanjosh', 'Singh', NULL, NULL, '221', NULL, NULL, NULL, NULL, NULL, NULL, 16),
(44, 44, 'Bradley', 'Glodny', NULL, NULL, '250', NULL, NULL, NULL, NULL, NULL, NULL, 16),
(45, 45, 'Vladyslava', 'Doktor', NULL, NULL, '255', NULL, NULL, NULL, NULL, NULL, NULL, 16),
(46, 46, 'Chrystia', 'Slywotzky', NULL, NULL, '2912', NULL, NULL, NULL, NULL, NULL, NULL, 17),
(47, 47, 'Ami', 'Patel', NULL, NULL, '1370', NULL, NULL, NULL, NULL, NULL, NULL, 18),
(48, 48, 'Jessica', 'Brewer', NULL, NULL, '1371', NULL, NULL, NULL, NULL, NULL, NULL, 18),
(49, 49, 'Katrina', 'TriskoRD', NULL, NULL, '1372', NULL, NULL, NULL, NULL, NULL, NULL, 18),
(50, 50, 'Avi', 'Retter', NULL, NULL, '286', NULL, NULL, NULL, NULL, NULL, NULL, 19),
(51, 51, 'Avi', 'Retter', NULL, NULL, '291', NULL, NULL, NULL, NULL, NULL, NULL, 19),
(52, 52, 'Richard', 'Nass', NULL, NULL, '298', NULL, NULL, NULL, NULL, NULL, NULL, 19),
(53, 53, 'Jason', 'Deutsch', NULL, NULL, '1660', NULL, NULL, NULL, NULL, NULL, NULL, 20),
(54, 54, 'Daniel', 'Wank', NULL, NULL, '1661', NULL, NULL, NULL, NULL, NULL, NULL, 20),
(55, 55, 'Adam', 'Persky', NULL, NULL, '1662', NULL, NULL, NULL, NULL, NULL, NULL, 20),
(56, 56, 'Gillian', 'Katz', NULL, NULL, '1434', NULL, NULL, NULL, NULL, NULL, NULL, 21),
(57, 57, 'Olga', 'Leonardi', NULL, NULL, '1449', NULL, NULL, NULL, NULL, NULL, NULL, 21),
(58, 58, 'Rahul', 'Agarwal', NULL, NULL, '1451', NULL, NULL, NULL, NULL, NULL, NULL, 21),
(59, 59, 'Lisa', 'Tran', NULL, NULL, '1859', NULL, NULL, NULL, NULL, NULL, NULL, 22),
(60, 60, 'Steven', 'Moalemi', NULL, NULL, '1860', NULL, NULL, NULL, NULL, NULL, NULL, 22),
(61, 61, 'Lauren', 'Solomont', NULL, NULL, '1861', NULL, NULL, NULL, NULL, NULL, NULL, 22),
(62, 62, 'Jeffrey', 'Mazlin', NULL, NULL, '301', NULL, NULL, NULL, NULL, NULL, NULL, 23),
(63, 63, 'Jeffrey', 'Mazlin', NULL, NULL, '454', NULL, NULL, NULL, NULL, NULL, NULL, 23),
(64, 64, 'Noah', 'Sands', NULL, NULL, '505', NULL, NULL, NULL, NULL, NULL, NULL, 23),
(65, 65, 'Godfrey', 'Aneke', NULL, NULL, '251', NULL, NULL, NULL, NULL, NULL, NULL, 24),
(66, 66, 'Carolyn', 'Iocolano', NULL, NULL, '506', NULL, NULL, NULL, NULL, NULL, NULL, 24),
(67, 67, 'Godfrey', 'Aneke', NULL, NULL, '1483', NULL, NULL, NULL, NULL, NULL, NULL, 24),
(68, 68, 'Matthew', 'Pabis', NULL, NULL, '254', NULL, NULL, NULL, NULL, NULL, NULL, 25),
(69, 69, 'Felix', 'Chien', NULL, NULL, '256', NULL, NULL, NULL, NULL, NULL, NULL, 25),
(70, 70, 'Felix', 'Chien', NULL, NULL, '257', NULL, NULL, NULL, NULL, NULL, NULL, 25),
(71, 71, 'Ryan', 'Rifkin', NULL, NULL, '1453', NULL, NULL, NULL, NULL, NULL, NULL, 26),
(72, 72, 'Ryan', 'Rifkin', NULL, NULL, '1454', NULL, NULL, NULL, NULL, NULL, NULL, 26),
(73, 73, 'Ryan', 'Rifkin', NULL, NULL, '2276', NULL, NULL, NULL, NULL, NULL, NULL, 26),
(74, 74, 'Nicholas', 'Wessling', NULL, NULL, '6701', NULL, NULL, NULL, NULL, NULL, NULL, 27),
(75, 75, 'Justin', 'Tsai', NULL, NULL, '6722', NULL, NULL, NULL, NULL, NULL, NULL, 27),
(76, 76, 'Nicholas', 'Wessling', NULL, NULL, '6736', NULL, NULL, NULL, NULL, NULL, NULL, 27),
(77, 77, 'Nathaniel', 'Mendelsohn', NULL, NULL, '1516', NULL, NULL, NULL, NULL, NULL, NULL, 28),
(78, 78, 'Nathaniel', 'Mendelsohn', NULL, NULL, '4319', NULL, NULL, NULL, NULL, NULL, NULL, 28),
(79, 79, 'Jonathan', 'Erber', NULL, NULL, '1494', NULL, NULL, NULL, NULL, NULL, NULL, 29),
(80, 80, 'Anthony', 'Starpoli', NULL, NULL, '1503', NULL, NULL, NULL, NULL, NULL, NULL, 29),
(81, 81, 'Michael', 'Smith', NULL, NULL, '1505', NULL, NULL, NULL, NULL, NULL, NULL, 29),
(82, 82, 'Jim', 'Li', NULL, NULL, '6055', NULL, NULL, NULL, NULL, NULL, NULL, 30),
(83, 83, 'Tak', 'Tai', NULL, NULL, '2214', NULL, NULL, NULL, NULL, NULL, NULL, 31),
(84, 84, 'Tak', 'Tai', NULL, NULL, '4997', NULL, NULL, NULL, NULL, NULL, NULL, 31),
(85, 85, 'Karen', 'Brodman', NULL, NULL, '3041', NULL, NULL, NULL, NULL, NULL, NULL, 32),
(86, 86, 'Joon', 'Song', NULL, NULL, '3043', NULL, NULL, NULL, NULL, NULL, NULL, 32),
(87, 87, 'Karen', 'Brodman', NULL, NULL, '3048', NULL, NULL, NULL, NULL, NULL, NULL, 32),
(88, 88, 'Louis', 'Catalano', NULL, NULL, '7843', NULL, NULL, NULL, NULL, NULL, NULL, 33),
(89, 89, 'Louis', 'Catalano', NULL, NULL, '8421', NULL, NULL, NULL, NULL, NULL, NULL, 33),
(90, 90, 'Andrew', 'Leder', NULL, NULL, '2619', NULL, NULL, NULL, NULL, NULL, NULL, 34),
(91, 91, 'Salil', 'Gupta', NULL, NULL, '2620', NULL, NULL, NULL, NULL, NULL, NULL, 34),
(92, 92, 'Ann', 'Green', NULL, NULL, '2621', NULL, NULL, NULL, NULL, NULL, NULL, 34),
(93, 93, 'Alexa', 'Lessow', NULL, NULL, '502', NULL, NULL, NULL, NULL, NULL, NULL, 35),
(94, 94, 'Alexa', 'Lessow', NULL, NULL, '513', NULL, NULL, NULL, NULL, NULL, NULL, 35),
(95, 95, 'Bartosz', 'Walczyszyn', NULL, NULL, '2827', NULL, NULL, NULL, NULL, NULL, NULL, 36),
(96, 96, 'Steven', 'Moalemi', NULL, NULL, '2828', NULL, NULL, NULL, NULL, NULL, NULL, 36),
(97, 97, 'Avi', 'Retter', NULL, NULL, '2829', NULL, NULL, NULL, NULL, NULL, NULL, 36),
(98, 98, 'Eric', 'Small', NULL, NULL, '7860', NULL, NULL, NULL, NULL, NULL, NULL, 37),
(99, 99, 'Edward', 'Zoltan', NULL, NULL, '7998', NULL, NULL, NULL, NULL, NULL, NULL, 37),
(100, 100, 'Edward', 'Zoltan', NULL, NULL, '8125', NULL, NULL, NULL, NULL, NULL, NULL, 37),
(101, 101, 'William', 'Mandell', NULL, NULL, '412', NULL, NULL, NULL, NULL, NULL, NULL, 38),
(102, 102, 'Dennis', 'Karter', NULL, NULL, '426', NULL, NULL, NULL, NULL, NULL, NULL, 38),
(103, 103, 'Dennis', 'Karter', NULL, NULL, '435', NULL, NULL, NULL, NULL, NULL, NULL, 38),
(104, 104, 'Melissa', 'Leber', NULL, NULL, '261', NULL, NULL, NULL, NULL, NULL, NULL, 39),
(105, 105, 'Melissa', 'Leber', NULL, NULL, '262', NULL, NULL, NULL, NULL, NULL, NULL, 39),
(106, 106, 'Ami', 'Patel', NULL, NULL, '299', NULL, NULL, NULL, NULL, NULL, NULL, 39),
(107, 107, 'Nailun', 'Chang', NULL, NULL, '757', NULL, NULL, NULL, NULL, NULL, NULL, 40),
(108, 108, 'Dr.Â Pramod Sanghi,Â MD', 'Dr.Â Pramod Sanghi,Â MD', NULL, NULL, '4095', NULL, NULL, NULL, NULL, NULL, NULL, 40),
(109, 109, 'Jay', 'Adlersberg', NULL, NULL, '9027', NULL, NULL, NULL, NULL, NULL, NULL, 40),
(110, 110, 'Amy', 'Wu', NULL, NULL, '6490', NULL, NULL, NULL, NULL, NULL, NULL, 41),
(111, 111, 'Amy', 'Wu', NULL, NULL, '6492', NULL, NULL, NULL, NULL, NULL, NULL, 41),
(112, 112, 'Pearl', 'Tung', NULL, NULL, '4507', NULL, NULL, NULL, NULL, NULL, NULL, 42),
(113, 113, 'Isamar', 'CM', NULL, NULL, '4515', NULL, NULL, NULL, NULL, NULL, NULL, 42),
(114, 114, 'Yuhan', 'CM', NULL, NULL, '4537', NULL, NULL, NULL, NULL, NULL, NULL, 42),
(115, 115, 'Faisal', 'Jamal', NULL, NULL, '766', NULL, NULL, NULL, NULL, NULL, NULL, 43),
(116, 116, 'Faisal', 'Jamal', NULL, NULL, '775', NULL, NULL, NULL, NULL, NULL, NULL, 43),
(117, 117, 'Anastasios', 'Papanagnou', NULL, NULL, '3596', NULL, NULL, NULL, NULL, NULL, NULL, 43),
(118, 118, 'Cheryl', 'Cottrol', NULL, NULL, '1512', NULL, NULL, NULL, NULL, NULL, NULL, 44),
(119, 119, 'Ewa', 'Koziorynska', NULL, NULL, '3696', NULL, NULL, NULL, NULL, NULL, NULL, 44),
(120, 120, 'Christine', 'Fitzpatrick', NULL, NULL, '3697', NULL, NULL, NULL, NULL, NULL, NULL, 44),
(121, 121, 'John', 'Sfakianos', NULL, NULL, '2175', NULL, NULL, NULL, NULL, NULL, NULL, 45),
(122, 122, 'John', 'Sfakianos', NULL, NULL, '1642', NULL, NULL, NULL, NULL, NULL, NULL, 46),
(123, 123, 'Michael', 'Smith', NULL, NULL, '3886', NULL, NULL, NULL, NULL, NULL, NULL, 47),
(124, 124, 'Narayan', 'Sundaresan', NULL, NULL, '3887', NULL, NULL, NULL, NULL, NULL, NULL, 47),
(125, 125, 'Christopher', 'Kellner', NULL, NULL, '3888', NULL, NULL, NULL, NULL, NULL, NULL, 47),
(126, 126, 'James', 'Lee', NULL, NULL, '1853', NULL, NULL, NULL, NULL, NULL, NULL, 48),
(127, 127, 'Brooke', 'Morton', NULL, NULL, '300', NULL, NULL, NULL, NULL, NULL, NULL, 49),
(128, 128, 'Stefanie', 'Ammiano', NULL, NULL, '436', NULL, NULL, NULL, NULL, NULL, NULL, 49),
(129, 129, 'Stefanie', 'Ammiano', NULL, NULL, '438', NULL, NULL, NULL, NULL, NULL, NULL, 49),
(130, 130, 'Ashley', 'Sobel', NULL, NULL, '1432', NULL, NULL, NULL, NULL, NULL, NULL, 50),
(131, 131, 'Sandra', 'CDE', NULL, NULL, '1493', NULL, NULL, NULL, NULL, NULL, NULL, 50),
(132, 132, 'Jessica', 'Brewer', NULL, NULL, '4174', NULL, NULL, NULL, NULL, NULL, NULL, 50),
(133, 133, 'Ephraim', 'Ovitsh', NULL, NULL, '1496', NULL, NULL, NULL, NULL, NULL, NULL, 51),
(134, 134, 'Ephraim', 'Ovitsh', NULL, NULL, '1500', NULL, NULL, NULL, NULL, NULL, NULL, 51),
(135, 135, 'Jeffrey', 'Mazlin', NULL, NULL, '1536', NULL, NULL, NULL, NULL, NULL, NULL, 51),
(136, 136, 'Dongyi', 'OTR/L', NULL, NULL, '2672', NULL, NULL, NULL, NULL, NULL, NULL, 52),
(137, 137, 'Ellen', 'OT', NULL, NULL, '2688', NULL, NULL, NULL, NULL, NULL, NULL, 52),
(138, 138, 'Kathleen', 'ODonnell-Pickert', NULL, NULL, '2698', NULL, NULL, NULL, NULL, NULL, NULL, 52),
(139, 139, 'Elena', 'Geller', NULL, NULL, '2111', NULL, NULL, NULL, NULL, NULL, NULL, 53),
(140, 140, 'Elena', 'Geller', NULL, NULL, '2121', NULL, NULL, NULL, NULL, NULL, NULL, 53),
(141, 141, 'Elena', 'Geller', NULL, NULL, '2129', NULL, NULL, NULL, NULL, NULL, NULL, 53),
(142, 142, 'Ami', 'Patel', NULL, NULL, '2854', NULL, NULL, NULL, NULL, NULL, NULL, 54),
(143, 143, 'Abu', 'Ahmed', NULL, NULL, '2858', NULL, NULL, NULL, NULL, NULL, NULL, 54),
(144, 144, 'Abraham', 'Chachoua', NULL, NULL, '2859', NULL, NULL, NULL, NULL, NULL, NULL, 54),
(145, 145, 'Lev', 'Kalika', NULL, NULL, '2050', NULL, NULL, NULL, NULL, NULL, NULL, 55),
(146, 146, 'Leeber', 'Cohen', NULL, NULL, '2056', NULL, NULL, NULL, NULL, NULL, NULL, 55),
(147, 147, 'Allie', 'Nadelson', NULL, NULL, '2061', NULL, NULL, NULL, NULL, NULL, NULL, 55),
(148, 148, 'Michael', 'Smith', NULL, NULL, '2049', NULL, NULL, NULL, NULL, NULL, NULL, 56),
(149, 149, 'Jennifer', 'Zocca', NULL, NULL, '2051', NULL, NULL, NULL, NULL, NULL, NULL, 56),
(150, 150, 'Krishna', 'Patel', NULL, NULL, '2052', NULL, NULL, NULL, NULL, NULL, NULL, 56),
(151, 151, 'Ida', 'Anjomshoaa', NULL, NULL, '5034', NULL, NULL, NULL, NULL, NULL, NULL, 57),
(152, 152, 'Lloyd', 'Klausner', NULL, NULL, '5035', NULL, NULL, NULL, NULL, NULL, NULL, 57),
(153, 153, 'Paul', 'Cagle', NULL, NULL, '5036', NULL, NULL, NULL, NULL, NULL, NULL, 57),
(154, 154, 'Whitney', 'Mostafiz', NULL, NULL, '5197', NULL, NULL, NULL, NULL, NULL, NULL, 58),
(155, 155, 'Kristine', 'Hyon', NULL, NULL, '5224', NULL, NULL, NULL, NULL, NULL, NULL, 58),
(156, 156, 'Whitney', 'Mostafiz', NULL, NULL, '5225', NULL, NULL, NULL, NULL, NULL, NULL, 58),
(157, 157, 'Aleksey', 'Lazarev', NULL, NULL, '2624', NULL, NULL, NULL, NULL, NULL, NULL, 59),
(158, 158, 'Imran', 'Ashraf', NULL, NULL, '2627', NULL, NULL, NULL, NULL, NULL, NULL, 59),
(159, 159, 'Isaac', 'Namdar', NULL, NULL, '2629', NULL, NULL, NULL, NULL, NULL, NULL, 59),
(160, 160, 'Jose', 'Colon', NULL, NULL, '122', NULL, NULL, NULL, NULL, NULL, NULL, 60),
(161, 161, 'Jennifer', 'Zocca', NULL, NULL, '127', NULL, NULL, NULL, NULL, NULL, NULL, 60),
(162, 162, 'Jennifer', 'Zocca', NULL, NULL, '133', NULL, NULL, NULL, NULL, NULL, NULL, 60),
(163, 163, 'H.', 'Wisnicki', NULL, NULL, '2137', NULL, NULL, NULL, NULL, NULL, NULL, 61),
(164, 164, 'H.', 'Wisnicki', NULL, NULL, '4916', NULL, NULL, NULL, NULL, NULL, NULL, 61),
(165, 165, 'Douglas', 'Fredrick', NULL, NULL, '4938', NULL, NULL, NULL, NULL, NULL, NULL, 61),
(166, 166, 'Shahed', 'Quraishi', NULL, NULL, '764', NULL, NULL, NULL, NULL, NULL, NULL, 62),
(167, 167, 'Liel', 'Grinbaum', NULL, NULL, '1954', NULL, NULL, NULL, NULL, NULL, NULL, 63),
(168, 168, 'Elyse', 'Kerschner', NULL, NULL, '5703', NULL, NULL, NULL, NULL, NULL, NULL, 63),
(169, 169, 'Liel', 'Grinbaum', NULL, NULL, '5704', NULL, NULL, NULL, NULL, NULL, NULL, 63),
(170, 170, 'Sourab', 'Choudhury', NULL, NULL, '231', NULL, NULL, NULL, NULL, NULL, NULL, 64),
(171, 171, 'Sourab', 'Choudhury', NULL, NULL, '266', NULL, NULL, NULL, NULL, NULL, NULL, 64),
(172, 172, 'Sourab', 'Choudhury', NULL, NULL, '388', NULL, NULL, NULL, NULL, NULL, NULL, 64),
(173, 173, 'Marie', 'Lupica', NULL, NULL, '1704', NULL, NULL, NULL, NULL, NULL, NULL, 65),
(174, 174, 'Paul', 'Cagle', NULL, NULL, '2970', NULL, NULL, NULL, NULL, NULL, NULL, 66),
(175, 175, 'Paul', 'Cagle', NULL, NULL, '5942', NULL, NULL, NULL, NULL, NULL, NULL, 66),
(176, 176, 'Grace', 'Kim', NULL, NULL, '5988', NULL, NULL, NULL, NULL, NULL, NULL, 66),
(177, 177, 'Ann', 'Green', NULL, NULL, '7839', NULL, NULL, NULL, NULL, NULL, NULL, 67),
(178, 178, 'Ann', 'Green', NULL, NULL, '7881', NULL, NULL, NULL, NULL, NULL, NULL, 67),
(179, 179, 'Ann', 'Green', NULL, NULL, '8014', NULL, NULL, NULL, NULL, NULL, NULL, 67),
(180, 180, 'Alyssa', 'Hackett', NULL, NULL, '405', NULL, NULL, NULL, NULL, NULL, NULL, 68),
(181, 181, 'Alyssa', 'Hackett', NULL, NULL, '415', NULL, NULL, NULL, NULL, NULL, NULL, 68),
(182, 182, 'Alyssa', 'Hackett', NULL, NULL, '445', NULL, NULL, NULL, NULL, NULL, NULL, 68),
(183, 183, 'Eric', 'Small', NULL, NULL, '5504', NULL, NULL, NULL, NULL, NULL, NULL, 69),
(184, 184, 'Carolyn', 'Iocolano', NULL, NULL, '542', NULL, NULL, NULL, NULL, NULL, NULL, 70),
(185, 185, 'Jenny', 'Shih', NULL, NULL, '552', NULL, NULL, NULL, NULL, NULL, NULL, 70),
(186, 186, 'Eda', 'Chao', NULL, NULL, '567', NULL, NULL, NULL, NULL, NULL, NULL, 70),
(187, 187, 'Daniel', 'Wank', NULL, NULL, '1902', NULL, NULL, NULL, NULL, NULL, NULL, 71),
(188, 188, 'Daniel', 'Wank', NULL, NULL, '5116', NULL, NULL, NULL, NULL, NULL, NULL, 71),
(189, 189, 'Andrew', 'Leder', NULL, NULL, '5176', NULL, NULL, NULL, NULL, NULL, NULL, 71),
(190, 190, 'Steven', 'Moalemi', NULL, NULL, '108', NULL, NULL, NULL, NULL, NULL, NULL, 72),
(191, 191, 'Steven', 'Moalemi', NULL, NULL, '112', NULL, NULL, NULL, NULL, NULL, NULL, 72),
(192, 192, 'Steven', 'Moalemi', NULL, NULL, '113', NULL, NULL, NULL, NULL, NULL, NULL, 72),
(193, 193, 'Daniel', 'Wank', NULL, NULL, '2676', NULL, NULL, NULL, NULL, NULL, NULL, 73),
(194, 194, 'Avi', 'Retter', NULL, NULL, '2678', NULL, NULL, NULL, NULL, NULL, NULL, 73),
(195, 195, 'Zachary', 'DPT', NULL, NULL, '2679', NULL, NULL, NULL, NULL, NULL, NULL, 73),
(196, 196, 'Eduardo Yarur,Â PA', 'Eduardo Yarur,Â PA', NULL, NULL, '244', NULL, NULL, NULL, NULL, NULL, NULL, 74),
(197, 197, 'Eduardo Yarur,Â PA', 'Eduardo Yarur,Â PA', NULL, NULL, '246', NULL, NULL, NULL, NULL, NULL, NULL, 74),
(198, 198, 'Emily', 'Eppel', NULL, NULL, '303', NULL, NULL, NULL, NULL, NULL, NULL, 74),
(199, 199, 'Nilay', 'Shah', NULL, NULL, '6451', NULL, NULL, NULL, NULL, NULL, NULL, 75),
(200, 200, 'Sophie', 'Bartsich', NULL, NULL, '6452', NULL, NULL, NULL, NULL, NULL, NULL, 75),
(201, 201, 'Adam', 'Persky', NULL, NULL, '6453', NULL, NULL, NULL, NULL, NULL, NULL, 75),
(202, 202, 'Raphael', 'DPM', NULL, NULL, '6551', NULL, NULL, NULL, NULL, NULL, NULL, 76),
(203, 203, 'Nelya', 'DPM', NULL, NULL, '6552', NULL, NULL, NULL, NULL, NULL, NULL, 76),
(204, 204, 'Ami', 'Patel', NULL, NULL, '6553', NULL, NULL, NULL, NULL, NULL, NULL, 76),
(205, 205, 'Keith', 'Uleis', NULL, NULL, '312', NULL, NULL, NULL, NULL, NULL, NULL, 77),
(206, 206, 'Keith', 'Uleis', NULL, NULL, '314', NULL, NULL, NULL, NULL, NULL, NULL, 77),
(207, 207, 'Adam', 'Persky', NULL, NULL, '331', NULL, NULL, NULL, NULL, NULL, NULL, 77),
(208, 208, 'Khrystyna', 'Kostsyuh', NULL, NULL, '1928', NULL, NULL, NULL, NULL, NULL, NULL, 78),
(209, 209, 'Khrystyna', 'Kostsyuh', NULL, NULL, '5092', NULL, NULL, NULL, NULL, NULL, NULL, 78),
(210, 210, 'Maria', 'Chartzoulakis', NULL, NULL, '5134', NULL, NULL, NULL, NULL, NULL, NULL, 78),
(211, 211, 'Elena', 'Geller', NULL, NULL, '1409', NULL, NULL, NULL, NULL, NULL, NULL, 79),
(212, 212, 'Jacob', 'Leivent', NULL, NULL, '1413', NULL, NULL, NULL, NULL, NULL, NULL, 79),
(213, 213, 'Gordon', 'Strauss', NULL, NULL, '1417', NULL, NULL, NULL, NULL, NULL, NULL, 79),
(214, 214, 'Deborah', 'BarbierePsyD', NULL, NULL, '3026', NULL, NULL, NULL, NULL, NULL, NULL, 80),
(215, 215, 'Lawrence', 'Birnbach', NULL, NULL, '7311', NULL, NULL, NULL, NULL, NULL, NULL, 80),
(216, 216, 'Philip', 'PsyD', NULL, NULL, '7312', NULL, NULL, NULL, NULL, NULL, NULL, 80),
(217, 217, 'Elizabeth', 'Leung', NULL, NULL, '1515', NULL, NULL, NULL, NULL, NULL, NULL, 81),
(218, 218, 'Elizabeth', 'Leung', NULL, NULL, '4318', NULL, NULL, NULL, NULL, NULL, NULL, 81),
(219, 219, 'Olivia', 'Ko', NULL, NULL, '7315', NULL, NULL, NULL, NULL, NULL, NULL, 82),
(220, 220, 'Brittany', 'Croley', NULL, NULL, '7316', NULL, NULL, NULL, NULL, NULL, NULL, 82),
(221, 221, 'Heather', 'Lortie', NULL, NULL, '7319', NULL, NULL, NULL, NULL, NULL, NULL, 82),
(222, 222, 'Adil', 'Shujaat', NULL, NULL, '7723', NULL, NULL, NULL, NULL, NULL, NULL, 83),
(223, 223, 'Adil', 'Shujaat', NULL, NULL, '7751', NULL, NULL, NULL, NULL, NULL, NULL, 83),
(224, 224, 'George', 'Castro', NULL, NULL, '287', NULL, NULL, NULL, NULL, NULL, NULL, 84),
(225, 225, 'George', 'Castro', NULL, NULL, '422', NULL, NULL, NULL, NULL, NULL, NULL, 84),
(226, 226, 'Pervaiz', 'Iqbal', NULL, NULL, '566', NULL, NULL, NULL, NULL, NULL, NULL, 84),
(227, 227, 'Roberto', 'Lipsztein', NULL, NULL, '4563', NULL, NULL, NULL, NULL, NULL, NULL, 85),
(228, 228, 'Roberto', 'Lipsztein', NULL, NULL, '4564', NULL, NULL, NULL, NULL, NULL, NULL, 85),
(229, 229, 'James', 'Lee', NULL, NULL, '4568', NULL, NULL, NULL, NULL, NULL, NULL, 85),
(230, 230, 'Melanie', 'Montemayor', NULL, NULL, '7910', NULL, NULL, NULL, NULL, NULL, NULL, 86),
(231, 231, 'Menachem', 'Mandell', NULL, NULL, '7940', NULL, NULL, NULL, NULL, NULL, NULL, 86),
(232, 232, 'Eric', 'Small', NULL, NULL, '7973', NULL, NULL, NULL, NULL, NULL, NULL, 86),
(233, 233, 'Angie', 'Wen', NULL, NULL, '2092', NULL, NULL, NULL, NULL, NULL, NULL, 87),
(234, 234, 'Angie', 'Wen', NULL, NULL, '2201', NULL, NULL, NULL, NULL, NULL, NULL, 87),
(235, 235, 'Gregory', 'Pamel', NULL, NULL, '2218', NULL, NULL, NULL, NULL, NULL, NULL, 87),
(236, 236, 'Meir', 'Olcha', NULL, NULL, '3027', NULL, NULL, NULL, NULL, NULL, NULL, 88),
(237, 237, 'Aimee', 'Seungdamrong', NULL, NULL, '3028', NULL, NULL, NULL, NULL, NULL, NULL, 88),
(238, 238, 'Hyacinth', 'Browne', NULL, NULL, '3029', NULL, NULL, NULL, NULL, NULL, NULL, 88),
(239, 239, 'Avi', 'Retter', NULL, NULL, '2143', NULL, NULL, NULL, NULL, NULL, NULL, 89),
(240, 240, 'Millie', 'Fell', NULL, NULL, '2191', NULL, NULL, NULL, NULL, NULL, NULL, 89),
(241, 241, 'Millie', 'Fell', NULL, NULL, '4996', NULL, NULL, NULL, NULL, NULL, NULL, 89),
(242, 242, 'Priya', 'Chokshi', NULL, NULL, '242', NULL, NULL, NULL, NULL, NULL, NULL, 90),
(243, 243, 'Priya', 'Chokshi', NULL, NULL, '243', NULL, NULL, NULL, NULL, NULL, NULL, 90),
(244, 244, 'Jay', 'Adlersberg', NULL, NULL, '7869', NULL, NULL, NULL, NULL, NULL, NULL, 90),
(245, 245, 'Paul', 'Cagle', NULL, NULL, '7933', NULL, NULL, NULL, NULL, NULL, NULL, 91),
(246, 246, 'Paul', 'Cagle', NULL, NULL, '8060', NULL, NULL, NULL, NULL, NULL, NULL, 91),
(247, 247, 'Leesa', 'Galatz', NULL, NULL, '8518', NULL, NULL, NULL, NULL, NULL, NULL, 91),
(248, 248, 'Anthony', 'Starpoli', NULL, NULL, '305', NULL, NULL, NULL, NULL, NULL, NULL, 92),
(249, 249, 'Nagesh', 'Krish', NULL, NULL, '3947', NULL, NULL, NULL, NULL, NULL, NULL, 93),
(250, 250, 'Ewa', 'Koziorynska', NULL, NULL, '8195', NULL, NULL, NULL, NULL, NULL, NULL, 93),
(251, 251, 'Klaus-Dieter', 'Lessnau', NULL, NULL, '8196', NULL, NULL, NULL, NULL, NULL, NULL, 93),
(252, 252, 'Shervin', 'Najafi', NULL, NULL, '2659', NULL, NULL, NULL, NULL, NULL, NULL, 94),
(253, 253, 'Ryan', 'Rifkin', NULL, NULL, '2666', NULL, NULL, NULL, NULL, NULL, NULL, 94),
(254, 254, 'Shervin', 'Najafi', NULL, NULL, '5350', NULL, NULL, NULL, NULL, NULL, NULL, 94),
(255, 255, 'Ramon', 'Pesigan', NULL, NULL, '2682', NULL, NULL, NULL, NULL, NULL, NULL, 95),
(256, 256, 'Melissa', 'Leber', NULL, NULL, '2719', NULL, NULL, NULL, NULL, NULL, NULL, 95),
(257, 257, 'Eliana', 'Cardozo', NULL, NULL, '2724', NULL, NULL, NULL, NULL, NULL, NULL, 95),
(258, 258, 'Isaac', 'Namdar', NULL, NULL, '276', NULL, NULL, NULL, NULL, NULL, NULL, 96),
(259, 259, 'Isaac', 'Namdar', NULL, NULL, '378', NULL, NULL, NULL, NULL, NULL, NULL, 96),
(260, 260, 'Isaac', 'Namdar', NULL, NULL, '414', NULL, NULL, NULL, NULL, NULL, NULL, 96),
(261, 261, 'Natan', 'Schleider', NULL, NULL, '8865', NULL, NULL, NULL, NULL, NULL, NULL, 97),
(262, 262, 'Natan', 'Schleider', NULL, NULL, '8866', NULL, NULL, NULL, NULL, NULL, NULL, 97),
(263, 263, 'Jessica', 'Brewer', NULL, NULL, '8867', NULL, NULL, NULL, NULL, NULL, NULL, 97),
(264, 264, 'Faith', 'Chang', NULL, NULL, '472', NULL, NULL, NULL, NULL, NULL, NULL, 98),
(265, 265, 'Faith', 'Chang', NULL, NULL, '525', NULL, NULL, NULL, NULL, NULL, NULL, 98),
(266, 266, 'Daniel', 'Wank', NULL, NULL, '560', NULL, NULL, NULL, NULL, NULL, NULL, 98),
(267, 267, 'Joel', 'Hillelsohn', NULL, NULL, '3140', NULL, NULL, NULL, NULL, NULL, NULL, 99),
(268, 268, 'Farshad', 'Shafizadeh', NULL, NULL, '3156', NULL, NULL, NULL, NULL, NULL, NULL, 99),
(269, 269, 'Chongmin', 'Kim', NULL, NULL, '3162', NULL, NULL, NULL, NULL, NULL, NULL, 99),
(270, 270, 'John', 'Sfakianos', NULL, NULL, '3154', NULL, NULL, NULL, NULL, NULL, NULL, 100),
(271, 271, 'Michael', 'Smith', NULL, NULL, '3160', NULL, NULL, NULL, NULL, NULL, NULL, 100),
(272, 272, 'Edward', 'Zoltan', NULL, NULL, '3202', NULL, NULL, NULL, NULL, NULL, NULL, 100),
(273, 273, 'Jennifer', 'Zocca', NULL, NULL, '8674', NULL, NULL, NULL, NULL, NULL, NULL, 101),
(274, 274, 'Lauren', 'Solomont', NULL, NULL, '2379', NULL, NULL, NULL, NULL, NULL, NULL, 102),
(275, 275, 'Lauren', 'Solomont', NULL, NULL, '2380', NULL, NULL, NULL, NULL, NULL, NULL, 102),
(276, 276, 'Lauren', 'Solomont', NULL, NULL, '3128', NULL, NULL, NULL, NULL, NULL, NULL, 102);

-- --------------------------------------------------------

--
-- Table structure for table `doctor_calendar`
--

CREATE TABLE `doctor_calendar` (
  `schedule_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `clinic_id` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `notes` varchar(255) DEFAULT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doctor_patient_files`
--

CREATE TABLE `doctor_patient_files` (
  `document_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type_id` int(11) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp(),
  `notes` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `file_types`
--

CREATE TABLE `file_types` (
  `type_id` int(11) NOT NULL,
  `type_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `patient_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('Male','Female') DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `medical_history` text DEFAULT NULL,
  `emergency_contact_name` varchar(100) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `blood_type` enum('A+','A-','B+','B-','AB+','AB-','O+','O-') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`patient_id`, `user_id`, `first_name`, `last_name`, `date_of_birth`, `gender`, `phone`, `address`, `profile_picture`, `bio`, `medical_history`, `emergency_contact_name`, `emergency_contact_phone`, `blood_type`) VALUES
(4, 282, 'Ismail', 'Itani', '2025-05-06', 'Female', '03659392', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role`) VALUES
(1, 'Admin'),
(2, 'Doctor'),
(3, 'Patient');

-- --------------------------------------------------------

--
-- Table structure for table `specialties`
--

CREATE TABLE `specialties` (
  `specialty_id` int(11) NOT NULL,
  `specialty_name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `specialties`
--

INSERT INTO `specialties` (`specialty_id`, `specialty_name`, `description`) VALUES
(1, 'Acupuncturist', NULL),
(2, 'Addiction Specialist', NULL),
(3, 'Adult Nurse Practitioner', NULL),
(4, 'Adult Psychiatric & Mental Health Nurse Practitioner', NULL),
(5, 'Allergist', NULL),
(6, 'Anesthesiologist', NULL),
(7, 'Audiologist', NULL),
(8, 'Bariatric Surgeon', NULL),
(9, 'Cardiologist', NULL),
(10, 'Child and Adolescent Psychiatrist', NULL),
(11, 'Chiropractor', NULL),
(12, 'Clinical Neurophysiologist', NULL),
(13, 'Colorectal Surgeon', NULL),
(14, 'Cornea & External Diseases Specialist', NULL),
(15, 'Dentist', NULL),
(16, 'Dermatologist', NULL),
(17, 'Diagnostic Radiologist', NULL),
(18, 'Dietitian', NULL),
(19, 'Ear, Nose & Throat Doctor', NULL),
(20, 'Emergency Medicine Physician', NULL),
(21, 'Endocrinologist', NULL),
(22, 'Endodontist', NULL),
(23, 'Facial Plastic & Reconstructive Surgeon', NULL),
(24, 'Family Nurse Practitioner', NULL),
(25, 'Family Physician', NULL),
(26, 'Family Psychiatric & Mental Health Nurse Practitioner', NULL),
(27, 'Foot & Ankle Specialist', NULL),
(28, 'Forensic Psychiatrist', NULL),
(29, 'Gastroenterologist', NULL),
(30, 'Geriatrician', NULL),
(31, 'Glaucoma Specialist', NULL),
(32, 'Gynecologist', NULL),
(33, 'Hand & Microsurgery Specialist', NULL),
(34, 'Hand Surgeon', NULL),
(35, 'Head & Neck Surgeon', NULL),
(36, 'Hematologist', NULL),
(37, 'Hip and Knee Surgeon', NULL),
(38, 'Infectious Disease Specialist', NULL),
(39, 'Internist', NULL),
(40, 'Interventional Cardiologist', NULL),
(41, 'Laryngologist', NULL),
(42, 'Midwife', NULL),
(43, 'Nephrologist', NULL),
(44, 'Neurologist', NULL),
(45, 'Neuro-Ophthalmologist', NULL),
(46, 'Neuro-Otologist', NULL),
(47, 'Neurosurgeon', NULL),
(48, 'Nuclear Medicine Specialist', NULL),
(49, 'Nurse Practitioner', NULL),
(50, 'Nutritionist', NULL),
(51, 'OB-GYN', NULL),
(52, 'Occupational Therapist', NULL),
(53, 'Oculoplastic Surgeon', NULL),
(54, 'Oncologist', NULL),
(55, 'Ophthalmologist', NULL),
(56, 'Optometrist', NULL),
(57, 'Oral Surgeon', NULL),
(58, 'Orthodontist', NULL),
(59, 'Orthopedic Surgeon', NULL),
(60, 'Pain Management Specialist', NULL),
(61, 'Pediatric / Strabismus Eye Doctor', NULL),
(62, 'Pediatric Cardiologist', NULL),
(63, 'Pediatric Dentist', NULL),
(64, 'Pediatric Dermatologist', NULL),
(65, 'Pediatric Emergency Medicine Specialist', NULL),
(66, 'Pediatric Nurse Practitioner', NULL),
(67, 'Pediatric Orthopedic Surgeon', NULL),
(68, 'Pediatric Otolaryngologist', NULL),
(69, 'Pediatric Sports Medicine Specialist', NULL),
(70, 'Pediatrician', NULL),
(71, 'Periodontist', NULL),
(72, 'Physiatrist', NULL),
(73, 'Physical Therapist', NULL),
(74, 'Physician Assistant', NULL),
(75, 'Plastic Surgeon', NULL),
(76, 'Podiatrist', NULL),
(77, 'Primary Care Doctor', NULL),
(78, 'Prosthodontist', NULL),
(79, 'Psychiatrist', NULL),
(80, 'Psychologist', NULL),
(81, 'Psychosomatic Medicine Specialist', NULL),
(82, 'Psychotherapist', NULL),
(83, 'Pulmonary Diseases and Critical Care Medicine Specialist', NULL),
(84, 'Pulmonologist', NULL),
(85, 'Radiation Oncologist', NULL),
(86, 'Radiologist', NULL),
(87, 'Refractive Surgeon', NULL),
(88, 'Reproductive Endocrinologist', NULL),
(89, 'Retina Specialist (Medical)', NULL),
(90, 'Rheumatologist', NULL),
(91, 'Shoulder & Elbow Surgeon', NULL),
(92, 'Sinus Surgeon / Rhinologist', NULL),
(93, 'Sleep Medicine Specialist', NULL),
(94, 'Spine Specialist', NULL),
(95, 'Sports Medicine Specialist', NULL),
(96, 'Surgeon', NULL),
(97, 'Travel Medicine Specialist', NULL),
(98, 'Urgent Care Specialist', NULL),
(99, 'Urological Surgeon', NULL),
(100, 'Urologist', NULL),
(101, 'Vascular Surgeon', NULL),
(102, 'Women\'s Health Nurse Practitioner', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_verified` tinyint(4) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `email`, `password`, `role_id`, `is_active`, `is_verified`, `created_at`) VALUES
(1, 'test1@gmail.com', '$2b$12$a1HjCH.PaBiwjbdAoJLGou5.0rlaLFc95c5I6wEBc2B.hK98xajYC', 2, 1, 1, '2025-04-14 21:30:14'),
(2, 'test2@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(3, 'test3@gmail.com', '12345678', 2, 1, 1, '2025-04-14 21:30:14'),
(4, 'test4@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(5, 'test5@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(6, 'test6@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(7, 'test7@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(8, 'test8@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(9, 'test9@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(10, 'test10@gmail.com', '12345678', 2, 1, 1, '2025-04-14 21:30:14'),
(11, 'test11@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(12, 'test12@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(13, 'test13@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(14, 'test14@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(15, 'test15@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(16, 'test16@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(17, 'test17@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(18, 'test18@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(19, 'test19@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(20, 'test20@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(21, 'test21@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(22, 'test22@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(23, 'test23@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(24, 'test24@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(25, 'test25@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(26, 'test26@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(27, 'test27@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(28, 'test28@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(29, 'test29@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(30, 'test30@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(31, 'test31@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(32, 'test32@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(33, 'test33@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(34, 'test34@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(35, 'test35@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(36, 'test36@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(37, 'test37@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(38, 'test38@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(39, 'test39@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(40, 'test40@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(41, 'test41@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(42, 'test42@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(43, 'test43@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(44, 'test44@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(45, 'test45@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(46, 'test46@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(47, 'test47@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(48, 'test48@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(49, 'test49@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(50, 'test50@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(51, 'test51@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(52, 'test52@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(53, 'test53@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(54, 'test54@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(55, 'test55@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(56, 'test56@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(57, 'test57@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(58, 'test58@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(59, 'test59@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(60, 'test60@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(61, 'test61@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(62, 'test62@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(63, 'test63@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(64, 'test64@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(65, 'test65@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(66, 'test66@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(67, 'test67@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(68, 'test68@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(69, 'test69@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(70, 'test70@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(71, 'test71@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(72, 'test72@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(73, 'test73@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(74, 'test74@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(75, 'test75@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(76, 'test76@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(77, 'test77@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(78, 'test78@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(79, 'test79@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(80, 'test80@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(81, 'test81@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(82, 'test82@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(83, 'test83@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(84, 'test84@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(85, 'test85@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(86, 'test86@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(87, 'test87@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(88, 'test88@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(89, 'test89@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(90, 'test90@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(91, 'test91@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(92, 'test92@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(93, 'test93@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(94, 'test94@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(95, 'test95@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(96, 'test96@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(97, 'test97@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(98, 'test98@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(99, 'test99@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(100, 'test100@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(101, 'test101@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(102, 'test102@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(103, 'test103@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(104, 'test104@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(105, 'test105@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(106, 'test106@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(107, 'test107@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(108, 'test108@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(109, 'test109@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(110, 'test110@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(111, 'test111@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(112, 'test112@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(113, 'test113@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(114, 'test114@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(115, 'test115@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(116, 'test116@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(117, 'test117@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(118, 'test118@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(119, 'test119@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(120, 'test120@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(121, 'test121@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(122, 'test122@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(123, 'test123@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(124, 'test124@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(125, 'test125@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(126, 'test126@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(127, 'test127@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(128, 'test128@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(129, 'test129@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(130, 'test130@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(131, 'test131@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(132, 'test132@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(133, 'test133@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(134, 'test134@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(135, 'test135@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(136, 'test136@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(137, 'test137@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(138, 'test138@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(139, 'test139@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(140, 'test140@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(141, 'test141@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(142, 'test142@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(143, 'test143@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(144, 'test144@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(145, 'test145@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(146, 'test146@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(147, 'test147@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(148, 'test148@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(149, 'test149@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(150, 'test150@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(151, 'test151@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(152, 'test152@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(153, 'test153@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(154, 'test154@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(155, 'test155@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(156, 'test156@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(157, 'test157@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(158, 'test158@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(159, 'test159@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(160, 'test160@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(161, 'test161@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(162, 'test162@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(163, 'test163@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(164, 'test164@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(165, 'test165@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(166, 'test166@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(167, 'test167@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(168, 'test168@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(169, 'test169@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(170, 'test170@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(171, 'test171@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(172, 'test172@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(173, 'test173@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(174, 'test174@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(175, 'test175@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(176, 'test176@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(177, 'test177@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(178, 'test178@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(179, 'test179@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(180, 'test180@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(181, 'test181@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(182, 'test182@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(183, 'test183@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(184, 'test184@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(185, 'test185@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(186, 'test186@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(187, 'test187@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(188, 'test188@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(189, 'test189@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(190, 'test190@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(191, 'test191@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(192, 'test192@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(193, 'test193@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(194, 'test194@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(195, 'test195@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(196, 'test196@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(197, 'test197@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(198, 'test198@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(199, 'test199@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(200, 'test200@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(201, 'test201@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(202, 'test202@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(203, 'test203@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(204, 'test204@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(205, 'test205@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(206, 'test206@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(207, 'test207@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(208, 'test208@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(209, 'test209@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(210, 'test210@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(211, 'test211@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(212, 'test212@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(213, 'test213@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(214, 'test214@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(215, 'test215@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(216, 'test216@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(217, 'test217@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(218, 'test218@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(219, 'test219@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(220, 'test220@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(221, 'test221@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(222, 'test222@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(223, 'test223@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(224, 'test224@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(225, 'test225@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(226, 'test226@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(227, 'test227@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(228, 'test228@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(229, 'test229@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(230, 'test230@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(231, 'test231@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(232, 'test232@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(233, 'test233@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(234, 'test234@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(235, 'test235@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(236, 'test236@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(237, 'test237@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(238, 'test238@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(239, 'test239@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(240, 'test240@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(241, 'test241@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(242, 'test242@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(243, 'test243@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(244, 'test244@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(245, 'test245@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(246, 'test246@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(247, 'test247@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(248, 'test248@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(249, 'test249@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(250, 'test250@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(251, 'test251@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(252, 'test252@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(253, 'test253@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(254, 'test254@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(255, 'test255@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(256, 'test256@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(257, 'test257@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(258, 'test258@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(259, 'test259@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(260, 'test260@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(261, 'test261@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(262, 'test262@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(263, 'test263@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(264, 'test264@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(265, 'test265@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(266, 'test266@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(267, 'test267@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(268, 'test268@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(269, 'test269@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(270, 'test270@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(271, 'test271@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(272, 'test272@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(273, 'test273@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(274, 'test274@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(275, 'test275@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:14'),
(276, 'test276@gmail.com', '12345678', 2, 1, 0, '2025-04-14 21:30:39'),
(277, 'patient1@gmail.com', '$2b$12$DEk1q/f3an4zdiTq7YJPCO4cXc5pt5VrXzfCsiOXjz6DfOc2b97ju', 3, 1, 1, '2025-04-27 18:11:09'),
(278, 'admin@gmail.com', '$2b$12$NdZq2Q8IgcK.O7D365mgOuHsRUJ7IEBUXe/LrIs0.hudNC8JWg8Uu', 1, 1, 1, '2025-04-28 08:44:34'),
(282, '12131694@students.liu.edu.lb', '$2a$12$frWBlUi52Vg1KN6w5bnSa.sLHhhuNTO40BZc488VX0Q64uKEtdtlC', 3, 1, 1, '2025-05-08 15:52:30');

-- --------------------------------------------------------

--
-- Table structure for table `user_files`
--

CREATE TABLE `user_files` (
  `file_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type_id` int(11) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`appointment_id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `slot_id` (`slot_id`);

--
-- Indexes for table `appointment_slots`
--
ALTER TABLE `appointment_slots`
  ADD PRIMARY KEY (`slot_id`),
  ADD UNIQUE KEY `doctor_id` (`doctor_id`,`clinic_id`,`slot_date`,`start_time`),
  ADD KEY `clinic_id` (`clinic_id`);

--
-- Indexes for table `chat_history`
--
ALTER TABLE `chat_history`
  ADD PRIMARY KEY (`chat_history_id`),
  ADD KEY `userid_foreign_key` (`user_id`);

--
-- Indexes for table `clinics`
--
ALTER TABLE `clinics`
  ADD PRIMARY KEY (`clinic_id`);

--
-- Indexes for table `clinic_calendar`
--
ALTER TABLE `clinic_calendar`
  ADD PRIMARY KEY (`schedule_id`),
  ADD UNIQUE KEY `unique_clinic_date` (`clinic_id`,`date`);

--
-- Indexes for table `clinic_doctor`
--
ALTER TABLE `clinic_doctor`
  ADD PRIMARY KEY (`clinic_id`,`doctor_id`),
  ADD KEY `doctor_id` (`doctor_id`);

--
-- Indexes for table `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`doctor_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `license_number` (`license_number`),
  ADD UNIQUE KEY `user_id_2` (`user_id`),
  ADD KEY `doctors_ibfk_2` (`specialty_id`);

--
-- Indexes for table `doctor_calendar`
--
ALTER TABLE `doctor_calendar`
  ADD PRIMARY KEY (`schedule_id`),
  ADD UNIQUE KEY `unique_doctor_date` (`doctor_id`,`date`),
  ADD KEY `clinic_id` (`clinic_id`);

--
-- Indexes for table `doctor_patient_files`
--
ALTER TABLE `doctor_patient_files`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `doctor_id` (`doctor_id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `file_type_id` (`file_type_id`);

--
-- Indexes for table `file_types`
--
ALTER TABLE `file_types`
  ADD PRIMARY KEY (`type_id`),
  ADD UNIQUE KEY `type_name` (`type_name`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`patient_id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_UNIQUE` (`role`);

--
-- Indexes for table `specialties`
--
ALTER TABLE `specialties`
  ADD PRIMARY KEY (`specialty_id`),
  ADD UNIQUE KEY `specialty_name` (`specialty_name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `_idx` (`role_id`);

--
-- Indexes for table `user_files`
--
ALTER TABLE `user_files`
  ADD PRIMARY KEY (`file_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `file_type_id` (`file_type_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `appointment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `appointment_slots`
--
ALTER TABLE `appointment_slots`
  MODIFY `slot_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `chat_history`
--
ALTER TABLE `chat_history`
  MODIFY `chat_history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `clinics`
--
ALTER TABLE `clinics`
  MODIFY `clinic_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `clinic_calendar`
--
ALTER TABLE `clinic_calendar`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `doctors`
--
ALTER TABLE `doctors`
  MODIFY `doctor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=277;

--
-- AUTO_INCREMENT for table `doctor_calendar`
--
ALTER TABLE `doctor_calendar`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `doctor_patient_files`
--
ALTER TABLE `doctor_patient_files`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `file_types`
--
ALTER TABLE `file_types`
  MODIFY `type_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `patient_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `specialties`
--
ALTER TABLE `specialties`
  MODIFY `specialty_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=283;

--
-- AUTO_INCREMENT for table `user_files`
--
ALTER TABLE `user_files`
  MODIFY `file_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`slot_id`) REFERENCES `appointment_slots` (`slot_id`) ON DELETE CASCADE;

--
-- Constraints for table `appointment_slots`
--
ALTER TABLE `appointment_slots`
  ADD CONSTRAINT `appointment_slots_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointment_slots_ibfk_2` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`clinic_id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_history`
--
ALTER TABLE `chat_history`
  ADD CONSTRAINT `userid_foreign_key` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `clinic_calendar`
--
ALTER TABLE `clinic_calendar`
  ADD CONSTRAINT `clinic_calendar_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`clinic_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `clinic_doctor`
--
ALTER TABLE `clinic_doctor`
  ADD CONSTRAINT `clinic_doctor_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`clinic_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `clinic_doctor_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `doctors`
--
ALTER TABLE `doctors`
  ADD CONSTRAINT `doctors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `doctors_ibfk_2` FOREIGN KEY (`specialty_id`) REFERENCES `specialties` (`specialty_id`) ON DELETE CASCADE;

--
-- Constraints for table `doctor_calendar`
--
ALTER TABLE `doctor_calendar`
  ADD CONSTRAINT `doctor_calendar_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `doctor_calendar_ibfk_2` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`clinic_id`) ON DELETE CASCADE;

--
-- Constraints for table `doctor_patient_files`
--
ALTER TABLE `doctor_patient_files`
  ADD CONSTRAINT `doctor_patient_files_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `doctor_patient_files_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `doctor_patient_files_ibfk_3` FOREIGN KEY (`file_type_id`) REFERENCES `file_types` (`type_id`) ON DELETE CASCADE;

--
-- Constraints for table `patients`
--
ALTER TABLE `patients`
  ADD CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_fk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_files`
--
ALTER TABLE `user_files`
  ADD CONSTRAINT `user_files_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_files_ibfk_2` FOREIGN KEY (`file_type_id`) REFERENCES `file_types` (`type_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
