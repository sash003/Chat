<?php

$ini = parse_ini_file(ROOT."/config/db_conf.ini");
        $this->host = $ini['host'];
        $this->dbname = $ini['dbname'];
        $this->user = $ini['user'];
        $this->password = $ini['password'];
        $this->chatTable = $ini['chatTable'];