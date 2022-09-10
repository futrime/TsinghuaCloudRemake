<?php

/**
 *    Copyright (c) 2022 Futrime
 *    清华大学云盘 Remake is licensed under Mulan PSL v2.
 *    You can use this software according to the terms and conditions of the Mulan PSL v2. 
 *    You may obtain a copy of Mulan PSL v2 at:
 *                http://license.coscl.org.cn/MulanPSL2 
 *    THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.  
 *    See the Mulan PSL v2 for more details.  
 */

require "../config.php";

function updateUserInfo($data)
{
    global $pdo;
    $stmt = $pdo->prepare("SELECT * FROM `tcr_user` WHERE `username`=? ");
    $stmt->execute(array($data->username));
    $list = $stmt->fetch();
    if ($list == false) { // if the user is not existed
        if (!isset($data->following)) {
            $data->following = array();
        }
        if (!isset($data->collection)) {
            $data->collection = array();
        }
        if (!isset($data->metadata)) {
            $data->metadata = new stdClass();
        }
        $sql = "INSERT INTO `tcr_user` (`username`, `name`, `email`, `following`, `collection`, `avatar_url`, `metadata`) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $pdo->prepare($sql)->execute(array($data->username, $data->name, $data->email, json_encode($data->following), json_encode($data->collection), $data->avatar_url, json_encode($data->metadata)));
    } else {
        if (!isset($data->following)) {
            $data->following = json_decode($list['following']);
        }
        if (!isset($data->collection)) {
            $data->collection = json_decode($list['collection']);
        }
        if (!isset($data->metadata)) {
            $data->metadata = json_decode($list['metadata']);
        }
        $sql = "UPDATE `tcr_user` SET `name`=?, `email`=?, `following`=?, `collection`=?, `avatar_url`=?, `metadata`=? WHERE `username`=?";
        $pdo->prepare($sql)->execute(array($data->name, $data->email, json_encode($data->following), json_encode($data->collection), $data->avatar_url, json_encode($data->metadata), $data->username));
    }
}

function followUser($data)
{
    global $pdo;
    $stmt = $pdo->prepare("SELECT * FROM `tcr_user` WHERE `username`=? ");
    $stmt->execute(array($data->username));
    $follower = $stmt->fetch();
    $follower['following'] = json_decode($follower['following']);
    if ($data->type == 'follow') {
        $follower['following'][] = $data->follow;
        $pdo->prepare("UPDATE `tcr_user` SET `following`=? WHERE `username`=? ; UPDATE `tcr_user` SET `followed_count`=`followed_count` + 1 WHERE `username`=? ;")
            ->execute(array(json_encode($follower['following']), $data->username, $data->follow));
    } else if ($data->type == 'unfollow') {
        array_splice($follower['following'], array_search($data->follow, $follower['following']), 1);
        $pdo->prepare("UPDATE `tcr_user` SET `following`=? WHERE `username`=? ; UPDATE `tcr_user` SET `followed_count`=`followed_count` - 1 WHERE `username`=? ;")
            ->execute(array(json_encode($follower['following']), $data->username, $data->follow));
    }
}

function getUserInfo($username)
{
    global $pdo;
    $sql = "SELECT * FROM `tcr_user` WHERE `username`=? ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(array($username));
    $list = $stmt->fetch();
    if ($list == false) {
        return false;
    }
    return array('username' => $list['username'], 'name' => $list['name'], 'email' => $list['email'], 'followed_count' => (int)$list['followed_count'], 'following' => json_decode($list['following']), 'collection' => json_decode($list['collection']), 'avatar_url' => $list['avatar_url'], 'metadata' => json_decode($list['metadata']));
}


$pdo = new PDO('mysql:host=' . DB_HOST . ';' . 'dbname=' . DB_NAME, DB_USER, DB_PASS);

if ($_SERVER['REQUEST_METHOD'] == 'GET') { // get user information
    $username = $_GET['username'];
    $result = getUserInfo($username);
    $json = json_encode($result);
    header('Content-Type: application/json');
    echo ($json);
} else if ($_SERVER['REQUEST_METHOD'] == 'POST') { // update user information
    $data = json_decode(file_get_contents('php://input'));
    if ($data->action == 'updateUserInfo') {
        updateUserInfo($data);
    } else if ($data->action == 'followUser') {
        followUser($data);
    }
}
