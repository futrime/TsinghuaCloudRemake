<?php

/**
 *    Copyright (c) 2022 Futrime & M1saka10010
 *    清华大学云盘 Remake is licensed under Mulan PSL v2.
 *    You can use this software according to the terms and conditions of the Mulan PSL v2. 
 *    You may obtain a copy of Mulan PSL v2 at:
 *                http://license.coscl.org.cn/MulanPSL2 
 *    THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.  
 *    See the Mulan PSL v2 for more details.  
 */

require "../config.php";

function addDanmaku($data)
{
    global $pdo;
    $sql = "INSERT INTO `tcr_danmaku` (`vid`, `author`, `color`,`text`,`time`,`type`,`metadata`) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $pdo->prepare($sql)->execute(array($data->vid, $data->author, $data->color, $data->text, $data->time, $data->type, json_encode($data->metadata)));
}

function getAllDanmaku($vid)
{
    global $pdo;
    $sql = "SELECT * FROM `tcr_danmaku` WHERE `vid`=? ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(array($vid));
    $list = $stmt->fetchAll();
    if ($list == false) {
        return array();
    }
    for ($i=0; $i < count($list); $i++) { 
        $list[$i]['metadata'] = json_decode($list[$i]['metadata']);
    }
    return $list;
}

$db_host = DB_HOST;
$db_user = DB_USER;
$db_pass = DB_PASS;
$db_name = DB_NAME;
$pdo_s = 'mysql:host=' . $db_host . ';' . 'dbname=' . $db_name;
$pdo = new PDO($pdo_s, $db_user, $db_pass);


if ($_SERVER['REQUEST_METHOD'] == 'GET') { // get all danmakus
    $vid = $_GET['vid'];
    $result = getAllDanmaku($vid);
    $list = array();
    for ($i = 0; $i < count($result); $i++) {
        $list[$i] = array('author' => $result[$i]['author'], 'color' => $result[$i]['color'], 'text' => $result[$i]['text'], 'time' => (float)$result[$i]['time'], 'type' => $result[$i]['type'], 'metadata' => $result[$i]['metadata']);
    }
    $json = json_encode($list);
    header('Content-Type: application/json');
    echo ($json);
} else if ($_SERVER['REQUEST_METHOD'] == 'POST') { // add a danmaku
    $data = json_decode(file_get_contents('php://input'));
    addDanmaku($data);
}
