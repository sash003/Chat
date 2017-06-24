<?php


// обработчик чата
class Handler {
  
  function __construct() {
    try{
      
      
      mb_internal_encoding('UTF-8');
      // читаем ini файл
      $ini = parse_ini_file(ROOT."/config/db_conf.ini");
      $this->host = $ini['host'];
      $this->dbname = $ini['dbname'];
      $this->user = $ini['user'];
      $this->password = $ini['password'];
      $this->chatTable = $ini['chatTable'];
      
      $this->db = new \PDO('mysql: host='.$this->host.'; dbname='. $this->dbname, $this->user, $this->password);
      
      $this->db->setAttribute( \PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION );
      $this->db->exec("SET NAMES 'utf8'"); 
      $this->db->exec("SET CHARACTER SET 'utf8'");
      $this->db->exec("SET SESSION collation_connection = 'utf8_general_ci'");
      
      
      if(empty($_COOKIE['login'])){
        header ("Location: /login.php");
      }else{
        $this->login = $_COOKIE['login'];
        $this->id = $this->selectUserId($this->login);
        if(!$this->id){
          header ("Location: /login.php");
        }
      }
      
   }catch(\PDOException $err) { 
      echo 'Ошибка при соединении с БД ' . $err->getMessage(). '<br> 
            в файле '.$err->getFile().", строка ".$err->getLine() . "<br><br>Стэк вызовов: " . preg_replace('/#\d+/', '<br>$0', $err->getTraceAsString()); 
      exit;  
   }
  }
  
  function selectUserId($login){
    $sql = "select `id` from `users` where `login`=?";
    $stmt = $this->db->prepare($sql);
    $stmt->execute(array($login));
    $data = $stmt->fetchAll();
    if($data){
      return $data[0]['id'];
    }
    return 0;
  }
  
  
  function listUsers(){
    $result = '';
    $stmt = $this->db->prepare("SELECT `id`, `login`, `online` FROM `users` where `id`!=?");
    $stmt->execute(array($this->id));
    while($row = $stmt->fetch(\PDO::FETCH_ASSOC)){
      if($row['online']){
        $online = "<img src='/template/images/online.png'/>";
      }else $online = "";
      $result .= "<li data-id='".$row['id']."'>".$row['login'].$online."</li>";
    }
    return $result;
  }
  
  function listPrev(){
    $result = '';
    $stmt = $this->db->prepare("SELECT * FROM `$this->chatTable` where `destination`='0' or `destination` like ? or `name`=(select `login` from `users` where `id`=?) order by `id` desc limit 10");
    $stmt->execute(array('% '.$this->id.' %', $this->id));
    $arrayPosts = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    $len = count($arrayPosts);
    for ($i = $len - 1; $i >= 0; $i--) {
      $result .= "<li class='msg' id='".$arrayPosts[$i]['id']."'>"
        ."<a class='nick'>".$arrayPosts[$i]['name']."</a><br>"
        .$arrayPosts[$i]['text']
        ."<span class='time'>".$arrayPosts[$i]['time']."</span>"
        ."</li>";
    }
    return $result;
  }
  
  function getPrev(){
    $id = intval($_POST['id']);
    if($id < 2) return;
    $id--;
    $firstId = $id - 10;
    $result = '';
    $stmt = $this->db->prepare("SELECT * FROM `$this->chatTable` where `id` between ? and ? and (`destination`='0' or `destination` like ? or `name`=(select `login` from `users` where `id`=?)) order by `id`");
    $stmt->execute(array($firstId, $id, '% '.$this->id.' %', $this->id));
    while($row = $stmt->fetch(\PDO::FETCH_ASSOC)){
      $result .= "<li class='msg' id='".$row['id']."'>"
        ."<a class='nick'>".$row['name']."</a><br>"
        .$row['text']
        ."<span class='time'>".$row['time']."</span>"
        ."</li>";
    }
    echo $result;
  }
  
  function uploadFile(){
    if(is_uploaded_file($_FILES['file']['tmp_name'])){
      $tmp = $_FILES['file']['tmp_name'];
      $size = $_FILES['file']['size'];
      $type = $this->get_mimeType($tmp);
      //echo $type;
      $supportMimeTypes = array(
        "image/jpg",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/x-ms-bmp",
        "image/vnd.djvu",
        "image/vnd.adobe.photoshop",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "text/rtf",
        "application/pdf",
        "application/msword",
        "application/x-rar",
        "application/octet-stream",
        "application/zip",
        "application/xml",
        "audio/mpeg"
      );
      
      if(!in_array($type, $supportMimeTypes) || $size > 10 * 1024 * 1024){
        exit('2');
      }
      
      $dir = './template/attachments';
      $namefile = $_FILES['file']['name'];
      $namefile = mb_convert_encoding($namefile, "UTF-8");
      $namefile = preg_replace('/[^\wа-яё.]/iu', '_', $namefile);
      $namefile = $this->translit($namefile);
      $path = $dir.'/'.$namefile;
      
      if(move_uploaded_file($_FILES['file']['tmp_name'], $path)){
        echo $path;
      }else{
        exit('2');
      }
    }else{
      exit('2');
    }
  }
  
  function translit($str) {
    $rus = array('А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я', 'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я');
    $lat = array('A', 'B', 'V', 'G', 'D', 'E', 'E', 'Gh', 'Z', 'I', 'Y', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'F', 'H', 'C', 'Ch', 'Sh', 'Sch', 'Y', 'Y', 'Y', 'E', 'Yu', 'Ya', 'a', 'b', 'v', 'g', 'd', 'e', 'e', 'gh', 'z', 'i', 'y', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'h', 'c', 'ch', 'sh', 'sch', 'y', 'y', 'y', 'e', 'yu', 'ya');
    return str_replace($rus, $lat, $str);
  }

    
  function get_mimeType($filename){
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $filename);
    finfo_close($finfo);
    return $mime;
  }
  
}