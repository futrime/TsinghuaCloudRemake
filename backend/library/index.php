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

function getFileInfo($query)
{
    global $pdo;
    $sql = "SELECT * FROM `tcr_library` WHERE `type`=? ";
    $query_array = array($query->type);
    if (isset($query->fid)) {
        $sql .= " AND `fid`=? ";
        $query_array[] = $query->fid;
    }
    if (isset($query->pid)) {
        $sql .= " AND `pid`=? ";
        $query_array[] = $query->pid;
    }
    if (isset($query->publisher)) {
        $sql .= " AND `publisher`=? ";
        $query_array[] = $query->publisher;
    }
    if (isset($query->tag)) {
        for ($i = 0; $i < count($query->tag); $i++) {
            $sql .= " AND `tag` LIKE ? ";
            $query_array[] = '%"' . $query->tag[$i] . '"%';
        }
    }
    $stmt = $pdo->prepare($sql);
    $stmt->execute($query_array);
    $list = $stmt->fetchAll();
    if ($list == false) {
        return false;
    }
    $result = array();
    for ($i = 0; $i < count($list); $i++) {
        $result[] = array(
            'fid' => $list[$i]['fid'],
            'pid' => $list[$i]['pid'],
            'publisher' => $list[$i]['publisher'],
            'time' => $list[$i]['time'],
            'type' => $list[$i]['type'],
            'tag' => json_decode($list[$i]['tag']),
            'brief' => $list[$i]['brief'],
            'url' => $list[$i]['url'],
            'visit_count' => (int)$list[$i]['visit_count'],
            'download_count' => (int)$list[$i]['download_count'],
            'like_count' => (int)$list[$i]['like_count'],
            'collect_count' => (int)$list[$i]['collect_count'],
            'poster' => $list[$i]['poster'],
            'metadata' => json_decode($list[$i]['metadata'])
        );
    }
    return $result;
}

function shareFile($data)
{
    global $pdo;
    if (!isset($data->poster)) {
        $data->poster = '';
    }
    $sql = "INSERT INTO `tcr_library` (`fid`, `pid`, `publisher`, `time`, `type`, `tag`, `brief`, `url`, `poster`, `metadata`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $pdo->prepare($sql)->execute(array($data->fid, $data->pid, $data->publisher, time(), $data->type, json_encode($data->tag), $data->brief, $data->url, $data->poster, json_encode($data->metadata)));
}

function performAction($data)
{
    global $pdo;
    if ($data->action == 'visit') {
        $pdo->prepare("UPDATE `tcr_library` SET `visit_count`=`visit_count` + 1 WHERE `fid`=? ;")
            ->execute(array($data->fid));
    } else if ($data->action == 'like') {
        $stmt = $pdo->prepare("SELECT * FROM `tcr_library` WHERE `fid`=? ");
        $stmt->execute(array($data->fid));
        $item = $stmt->fetch();
        if ($item == false) {
            return;
        }
        $metadata = (array)json_decode($item['metadata']);
        if (!isset($metadata['like_list'])) {
            $metadata['like_list'] = array();
        }
        if ($data->type == true) { // perform like
            $metadata['like_list'][] = $data->username;
            $metadata['like_list'] = array_unique($metadata['like_list']);
            $metadata['like_list'] = array_values($metadata['like_list']);
            $pdo->prepare("UPDATE `tcr_library` SET `like_count`=?, `metadata`=? WHERE `fid`=? ;")
                ->execute(array(count($metadata['like_list']), json_encode($metadata), $data->fid));
        } else { // withdraw like
            if (array_search($data->username, $metadata['like_list']) === false) {
                return;
            }
            array_splice($metadata['like_list'], array_search($data->username, $metadata['like_list']), 1);
            $pdo->prepare("UPDATE `tcr_library` SET `like_count`=?, `metadata`=? WHERE `fid`=? ;")
                ->execute(array(count($metadata['like_list']), json_encode($metadata), $data->fid));
        }
    } else if ($data->action == 'collect') {
        $stmt = $pdo->prepare("SELECT * FROM `tcr_user` WHERE `username`=? ");
        $stmt->execute(array($data->username));
        $item = $stmt->fetch();
        if ($item == false) {
            return;
        }
        $collection = json_decode($item['collection']);

        if ($data->type == true) {
            $collection[] = $data->fid;
            $collection = array_unique($collection);
            $collection = array_values($collection);
            $pdo->prepare("UPDATE `tcr_user` SET `collection`=? WHERE `username`=? ; UPDATE `tcr_library` SET `collect_count`=? WHERE `fid`=? ;")
                ->execute(array(json_encode($collection), $data->username, count($collection), $data->fid));
        } else {
            if (array_search($data->fid, $collection) === false) {
                return;
            }
            array_splice($collection, array_search($data->fid, $collection), 1);
            $pdo->prepare("UPDATE `tcr_user` SET `collection`=? WHERE `username`=? ; UPDATE `tcr_library` SET `collect_count`=? WHERE `fid`=? ;")
                ->execute(array(json_encode($collection), $data->username, count($collection), $data->fid));
        }
    } else if ($data->action == 'download') {
        $pdo->prepare("UPDATE `tcr_library` SET `download_count`=`download_count` + 1 WHERE `fid`=? ;")
            ->execute(array($data->fid));
    }
}


$pdo = new PDO('mysql:host=' . DB_HOST . ';' . 'dbname=' . DB_NAME, DB_USER, DB_PASS);


$data = json_decode(file_get_contents('php://input'));
if ($data->action == 'getFileInfo') {
    $results = getFileInfo($data);
    $json = json_encode($results);
    header('Content-Type: application/json');
    echo ($json);
} else if ($data->action == 'shareFile') {
    shareFile($data);
} else if (
    $data->action == 'visit' || $data->action == 'like' ||
    $data->action == 'collect' || $data->action == 'download'
) {
    performAction($data);
}
