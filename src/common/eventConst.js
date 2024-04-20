export const Event = {
    TEST: 'test',
};

export const HandleEvents = {
    TEST: 'test',
    GET_WORKSPACE: 'get_workspace',
    SET_WORKSPACE: 'set_workspace',
    GET_VIDEO_WORKSPACE: 'get_video_workspace',
    SET_VIDEO_WORKSPACE: 'set_video_workspace',
    SEARCH_ROOM_INFOS: 'search_room_infos',
    ADD_ROOM: 'add_room',
    ANYSIS_ROOM_INFO: 'anysis_room_info',
    OPEN_LINK_EXPORT: 'open_url',
    DELETE_ROOM: 'delete_room',
    ADD_DOWNLOAD_TASK: 'add_download_task',
    ADD_DOWNLOAD_TASK_BY_USERID: 'add_download_task_by_user',
    SELECT_DIR: 'select_dir',
    OPEN_DIR: 'open_dir',
    GET_DOWNLOADING_TASKLIST: 'get_downloading_tasklist',
    STOP_DOWNLOADING_TASK: 'stop_downloading_task',
    GET_SAVE_FILE_LIST: 'get_save_file_list',
    RECHECK_SAVE_FILE_LIST: 'recheck_save_file_list',
    ADD_OBSERVER_DOWNLOAD_TASK: 'add_observer_download_task',
    REMOVE_OBSERVER_DOWNLOAD_TASK: 'remove_observer_download_task',
    GET_OBSERVER_DOWNLOAD_TASK: 'get_observer_download_task',
    GET_TTWID: 'get_ttwid',
    GET_REALLINK: 'get_real_link',
    ANYSIS_ROOM_INFO_FROM_CENTER: 'anysis_room_info_from_center',
    ANYSIS_ROOM_INFO_BY_SECID: 'anysis_room_info_by_secid',
    EDIT_ROOM_TYPE: 'edit_room_type_by_userid',
    GET_VIDEO_INFO: 'get_video_info',
    DOWNLOAD_SMALL_VIDEO: 'download_small_video',
    OPEN_DEV_TOOLS: 'open_dev_tools',
};

export const RenderReceiveEvents = {
    PING: 'render_ping',
    PONG: 'render_pong',
};

export const RoomTypeOpts = [
    {
        value: '1',
        label: '舞蹈',
    },
    {
        value: '2',
        label: '唱歌',
    },
    {
        value: '3',
        label: '颜值',
    },
    {
        value: '4',
        label: '其他',
    },
];
