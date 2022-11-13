CREATE TABLE `questions` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`user_id` INT NOT NULL,
	`product_id` INT NOT NULL,
	`body` varchar(255) NOT NULL,
	`date` DATE NOT NULL,
	`helpfulness` INT NOT NULL,
	`reported` BOOLEAN NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `answers` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`question_id` INT NOT NULL,
	`body` varchar(60000) NOT NULL,
	`helpfulness` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `photos` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`answer_id` INT NOT NULL,
	`url` varchar(10000) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `users` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` varchar(255) NOT NULL UNIQUE,
	`email` varchar(255) NOT NULL UNIQUE,
	PRIMARY KEY (`id`)
);

ALTER TABLE `questions` ADD CONSTRAINT `questions_fk0` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);

ALTER TABLE `answers` ADD CONSTRAINT `answers_fk0` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`);

ALTER TABLE `photos` ADD CONSTRAINT `photos_fk0` FOREIGN KEY (`answer_id`) REFERENCES `answers`(`id`);
