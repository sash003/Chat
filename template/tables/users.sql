-- phpMyAdmin SQL Dump
-- version 4.2.9.1
-- http://www.phpmyadmin.net
--
-- Хост: localhost
-- Час створення: Чрв 12 2017 р., 22:13
-- Версія сервера: 5.5.40
-- Версія PHP: 5.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- База даних: `web4myself`
--

-- --------------------------------------------------------

--
-- Структура таблиці `users`
--

CREATE TABLE IF NOT EXISTS `users` (
`id` int(11) unsigned NOT NULL,
  `login` varchar(17) NOT NULL,
  `email` varchar(55) NOT NULL,
  `avatar` varchar(22) NOT NULL,
  `password` varchar(32) NOT NULL,
  `hashemail` varchar(32) NOT NULL,
  `isverify` enum('0','1') NOT NULL DEFAULT '0',
  `date` varchar(77) NOT NULL,
  `online` int(1) NOT NULL DEFAULT '0',
  `lastid` int(7) NOT NULL DEFAULT '0'
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;

--
-- Дамп даних таблиці `users`
--

INSERT INTO `users` (`id`, `login`, `email`, `avatar`, `password`, `hashemail`, `isverify`, `date`, `online`, `lastid`) VALUES
(1, 'sash', 'ilikeitalls@mail.ru', 'sash.png', '039f68152f160b88974fc024c3a0e5d9', 'b714987339b07d54ee67fc74365395f6', '1', '2017 Май Четверг 11-ого  - 20:51', 1, 22),
(2, 'Lazy_Den', 'denbir@i.ua', 'Lazy_Den.gif', '4319d2c19cda3bc1104791e460dc04bd', '74d6f00e4f9f3547fe174bfb5f9e89f1', '1', '2017 Май Четверг 11-ого  - 21:29', 0, 22),
(7, 'Kapitan_America', 'sash3003@gmail.com', 'Kapitan_America.png', 'e306f5eac0a3cb6f5efa92e79b44cd1e', '7f6cff9971ae1113e79f4c8aacab60eb', '1', '2017 Май Воскресение 14-ого  - 17:41', 0, 0),
(6, 'Vova', 'VovaNBroForever@yandex.ru', 'Vova.gif', 'e306f5eac0a3cb6f5efa92e79b44cd1e', '23ceeb8c176ff57889c58d66b258c775', '1', '2017 Май Воскресение 14-ого  - 17:39', 0, 4),
(8, 'VintIk', 'skuns@mail.ua', 'VintIk.jpg', '4319d2c19cda3bc1104791e460dc04bd', '787351e671102ca43076020d2c5b8fd6', '1', '2017 Май Вторник 16-ого  - 15:13', 0, 0),
(9, 'AJAX', 'ilikeitall@mail.ru', 'AJAX.jpg', 'e306f5eac0a3cb6f5efa92e79b44cd1e', '44490fd0a986956dd69e98bd5bd6707b', '1', '2017 Май Вторник 16-ого  - 22:54', 0, 0),
(12, 'Алекс', 'ilikeitall@mail.ruw', 'Алекс.jpg', '97b02b7f9ac61befe66256d2c46a56b6', 'cca41433be0acb534a2369f48a02d28b', '1', '2017 Май Воскресение 28-ого  - 14:37', 0, 0),
(13, 'qwerty', 'ilikeitalls2@mail.ru', 'qwerty.jpg', '039f68152f160b88974fc024c3a0e5d9', '8b3ecbf384c47f903d3116198515ae7a', '1', '2017 Май Вторник 30-ого  - 17:26', 0, 0);

--
-- Індекси збережених таблиць
--

--
-- Індекси таблиці `users`
--
ALTER TABLE `users`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `login` (`login`), ADD UNIQUE KEY `hashemail` (`hashemail`), ADD UNIQUE KEY `email` (`email`), ADD KEY `id` (`id`,`password`), ADD KEY `password` (`password`), ADD KEY `date` (`date`);

--
-- AUTO_INCREMENT для збережених таблиць
--

--
-- AUTO_INCREMENT для таблиці `users`
--
ALTER TABLE `users`
MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=14;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
