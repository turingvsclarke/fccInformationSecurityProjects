create database messageBoards;
use messageBoards

create table boards (
    board_id serial primary key,
    board_name varchar(20)
);

create table threads (
    thread_id serial primary key,
    foreign key (board_id) references boards(board_id),
    delete_password varchar(20),
    thread_text varchar(200),
    created_on datetime default current_timestamp,
    bumped_on datetime default current_timestamp,
    reported bool default 0,
    deleted bool default 0
);

create table replies (
    reply_id serial primary key,
    foreign key (thread_id) references threads(thread_id),
    reply_text varchar(200),
    created_on datetime default current_timestamp,
    delete_password varchar(20),
    reported bool default 0,
    deleted bool default 0
);