-- MySQL Script generated by MySQL Workbench
-- Thu Oct 26 23:28:32 2023
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `mydb` ;

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`Discussion Post`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Discussion Post` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Discussion Post` (
  `idDiscussion Post` INT NOT NULL AUTO_INCREMENT,
  `topic` LONGTEXT NOT NULL,
  `max_nof_selections` INT NOT NULL,
  `can_see_votes_during_voting` TINYINT NOT NULL,
  `admin_link` VARCHAR(255) NOT NULL,
  `topic_edit_date` DATE NULL,
  `will_be_voted` TINYINT NOT NULL,
  `vote_start_date` DATE NULL,
  `vote_end_date` DATE NULL,
  PRIMARY KEY (`idDiscussion Post`),
  UNIQUE INDEX `idDiscussion Post_UNIQUE` (`idDiscussion Post` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Visitor Link`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Visitor Link` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Visitor Link` (
  `link` VARCHAR(255) NOT NULL,
  `idDiscussion Post` INT NOT NULL,
  PRIMARY KEY (`link`),
  INDEX `fk_Visitor Link_Discussion Post_idx` (`idDiscussion Post` ASC) VISIBLE,
  CONSTRAINT `fk_Visitor Link_Discussion Post`
    FOREIGN KEY (`idDiscussion Post`)
    REFERENCES `mydb`.`Discussion Post` (`idDiscussion Post`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Idea`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Idea` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Idea` (
  `idIdea` INT NOT NULL AUTO_INCREMENT,
  `created_by` VARCHAR(255) NOT NULL,
  `nof_likes` INT NOT NULL DEFAULT 0,
  `create_date` DATE NOT NULL,
  `edit_date` DATE NULL,
  `edited_by_admin` TINYINT NULL,
  `text_body` LONGTEXT NOT NULL,
  `idDiscussion Post` INT NOT NULL,
  PRIMARY KEY (`idIdea`),
  INDEX `fk_Idea_Discussion Post1_idx` (`idDiscussion Post` ASC) VISIBLE,
  CONSTRAINT `fk_Idea_Discussion Post1`
    FOREIGN KEY (`idDiscussion Post`)
    REFERENCES `mydb`.`Discussion Post` (`idDiscussion Post`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Vote`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Vote` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Vote` (
  `idVote` INT NOT NULL AUTO_INCREMENT,
  `vote_date` DATE NOT NULL,
  `idIdea` INT NOT NULL,
  PRIMARY KEY (`idVote`),
  INDEX `fk_Vote_Idea1_idx` (`idIdea` ASC) VISIBLE,
  CONSTRAINT `fk_Vote_Idea1`
    FOREIGN KEY (`idIdea`)
    REFERENCES `mydb`.`Idea` (`idIdea`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Pro`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Pro` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Pro` (
  `idPro` INT NOT NULL AUTO_INCREMENT,
  `created_by` VARCHAR(255) NOT NULL,
  `nof_likes` INT NOT NULL DEFAULT 0,
  `create_date` DATE NOT NULL,
  `edit_date` DATE NULL,
  `edited_by_admin` TINYINT NULL,
  `text_body` LONGTEXT NOT NULL,
  `idIdea` INT NOT NULL,
  PRIMARY KEY (`idPro`),
  INDEX `fk_Pro_Idea1_idx` (`idIdea` ASC) VISIBLE,
  CONSTRAINT `fk_Pro_Idea1`
    FOREIGN KEY (`idIdea`)
    REFERENCES `mydb`.`Idea` (`idIdea`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Con`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Con` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Con` (
  `idCon` INT NOT NULL AUTO_INCREMENT,
  `created_by` VARCHAR(255) NOT NULL,
  `nof_likes` INT NOT NULL DEFAULT 0,
  `create_date` DATE NOT NULL,
  `edit_date` DATE NULL,
  `edited_by_admin` TINYINT NULL,
  `text_body` LONGTEXT NOT NULL,
  `idIdea` INT NOT NULL,
  PRIMARY KEY (`idCon`),
  INDEX `fk_Pro_Idea1_idx` (`idIdea` ASC) VISIBLE,
  CONSTRAINT `fk_Pro_Idea10`
    FOREIGN KEY (`idIdea`)
    REFERENCES `mydb`.`Idea` (`idIdea`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;