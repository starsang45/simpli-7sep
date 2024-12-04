let channelId = "UCAhKKbDO9-ymWZ_7iAFLBQQ"; //동물티비
let selectPeriod = "yesterday";
let sdate;
let edate;
let cnt = 0;
let items = [];
let replyItems = [];
let replyPromiseFunc = [];
let nextPageToken = "";
let isExit = false;

$(document).ready(function() {
    gapi.load("client", initClient);
    setPeriod(selectPeriod);
});

function initClient() {
    let key = searchParam("key");
    let cid = searchParam("cid");
    if (!key || !cid) {
        alert("key와 id가 필요합니다.");
        return;
    }

    gapi.client
        .init({
            apiKey: key,
            clientId: cid,
            discoveryDocs: [
                "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
            ],
            scope: "https://www.googleapis.com/auth/youtube.force-ssl",
        })
        .then(
            function() {
                // API is ready to use
                // Video ID for the "Charlie bit my finger" video
                // var channelId = "uh3kLLckTR0";
                // var channelId = channelId;
                // // Call the API to fetch comments
                // getComments(channelId);
            },
            function(error) {
                console.log(error);
            }
        );
}

function searchParam(key) {
    return new URLSearchParams(location.search).get(key);
}

function getComments(channelId) {
    gapi.client.youtube.commentThreads
        // gapi.client.youtube.comments
        .list({
            part: ["snippet"],
            allThreadsRelatedToChannelId: channelId,
            // videoId: videoId,
            maxResults: 100,
        })
        .then(
            function(response) {
                console.log("getComments = ", response);
                setCommentsList(response);
                if (!isExit && response.result.nextPageToken) {
                    getNextComments(channelId, response.result.nextPageToken);
                }
                if (isExit || !response.result.nextPageToken) {
                    displayResult();
                }
            },
            function(error) {
                console.log(error);
            }
        );
}

function getNextComments(channelId, nextPageToken) {
    gapi.client.youtube.commentThreads
        // gapi.client.youtube.comments
        .list({
            part: ["snippet"],
            allThreadsRelatedToChannelId: channelId,
            pageToken: nextPageToken,
            // videoId: videoId,
            maxResults: 100,
        })
        .then(
            function(response) {
                cnt++;
                console.log(`getNextComments(${cnt}) = `, response);
                setCommentsList(response);
                if (!isExit && response.result.nextPageToken) {
                    getNextComments(channelId, response.result.nextPageToken);
                }
                if (isExit || !response.result.nextPageToken) {
                    displayResult();
                }
            },
            function(error) {
                console.log(error);
            }
        );
}

function setCommentsList(res) {
    let scItems = [];
    for (let i = 0; i < res.result.items.length; i++) {
        let el = res.result.items[i];
        let item = {};
        item.id = el.id;
        item.etag = el.etag;
        item.authorName = el.snippet.topLevelComment.snippet.authorDisplayName;
        item.authorUrl = el.snippet.topLevelComment.snippet.authorChannelUrl;
        item.likeCount = el.snippet.topLevelComment.snippet.likeCount;
        item.publishedAt = el.snippet.topLevelComment.snippet.publishedAt;

        let pdate = new Date(item.publishedAt.substring(0, 10));
        // if (pdate < new Date("2023-03-12")) {
        if (pdate < new Date(sdate)) {
            isExit = true;
            break;
        }
        item.textDisplay = el.snippet.topLevelComment.snippet.textDisplay;
        item.videoId = el.snippet.topLevelComment.snippet.videoId;
        item.replyCount = el.snippet.totalReplyCount;

        scItems.push(item);
    }

    items = items.concat(scItems);
    console.log("setCommentsList = ", items);
}

async function getReplyComments(commentId) {
    return new Promise((resolve, reject) => {
        gapi.client.youtube.comments
            // gapi.client.youtube.comments
            .list({
                part: ["snippet"],
                parentId: commentId,
                maxResults: 100,
            })
            .then(
                function(response) {
                    console.log("getReplyComments = ", response);
                    resolve(setReplyCommentsList(response));
                },
                function(error) {
                    console.log(error);
                    reject(error);
                }
            );
    });
}

function setReplyCommentsList(res) {
    let ritems = [];

    for (let i = 0; i < res.result.items.length; i++) {
        let el = res.result.items[i];
        let item = {};
        item.id = el.id;
        item.etag = el.etag;
        item.authorName = el.snippet.authorDisplayName;
        item.authorUrl = el.snippet.authorChannelUrl;
        item.likeCount = el.snippet.likeCount;
        item.publishedAt = el.snippet.publishedAt;
        item.textDisplay = "&nbsp;&nbsp;&nbsp;└" + el.snippet.textDisplay;
        item.parentId = el.snippet.parentId;
        item.replyCount = 0;
        ritems.push(item);
    }
    return ritems;
}

function execute() {
    let key = searchParam("key");
    let cid = searchParam("cid");
    if (!key || !cid) {
        alert("key와 id가 필요합니다.");
        return;
    }

    items = [];
    replyItems = [];
    replyPromiseFunc = [];
    isExit = false;
    cnt = 0;
    getComments(channelId);
    let html = `
       <tr>
        <td colspan="6" height="50px"><img width='20px' src='img/loading.gif'></img></td>
       </tr>
    `;
    $("tbody").html(html);
}

async function displayResult() {
    items = items.concat(replyItems);

    items.forEach((el) => {
        if (el.replyCount > 0) {
            replyPromiseFunc.push(getReplyComments(el.id));
        }
    });
    let rlist = await Promise.all(replyPromiseFunc);

    rlist.forEach((arr) => {
        arr.forEach((i) => {
            //const idx = (el) => el.id ===
            const fidx = items.findIndex((el) => i.parentId === el.id);
            items.splice(fidx + 1, 0, i);
        });
    });

    console.log(items);

    console.log("displayResult = ", items);
    goHtml(items);
}

function goHtml(items) {
    let html = "";
    items.forEach((el) => {
        html += `<tr>
        <td style='text-align:left;'>${el.textDisplay}</td>
        <td>${el.likeCount}</td>
        <td>${el.replyCount}</td>
        <td><a href='https://www.youtube.com/watch?v=${
          el.videoId
        }' target='_blank'>${el.videoId}</a></td>
        <td>${el.publishedAt.substring(0, 16)}</td>
        <td><a href='${el.authorUrl}' target='_blank'>${
      el.authorName
    }</a></td>        
        </tr>`;
    });

    $("tbody").html(html);
    $(".search-count").html(`건수 : ${items.length}건`);
}

function selectChannel(el) {
    console.log($(el).val());
    channelId = $(el).val();
    items = [];
    replyItems = [];
    replyPromiseFunc = [];
    isExit = false;
    cnt = 0;
    let html = `
       <tr>
       <td colspan="6" height="50px">채널과 기간을 선택한 후 '댓글보기' 버튼을 눌러 주세요..</td>
       </tr>
    `;
    $("tbody").html(html);
}

function selectDay(el) {
    selectPeriod = $(el).attr("for");
    setPeriod(selectPeriod);
}

function setPeriod(period) {
    let today = new Date();
    edate = new Date().toISOString().substring(0, 10);
    if (period === "yesterday") {
        let yesterday = new Date(today.setDate(today.getDate() - 1));
        sdate = yesterday.toISOString().substring(0, 10);
        console.log(sdate, getDayOfWeek(sdate), edate, getDayOfWeek(edate));
    } else if (period === "week") {
        let week = new Date(today.setDate(today.getDate() - 7));
        sdate = week.toISOString().substring(0, 10);
        console.log(sdate, getDayOfWeek(sdate), edate, getDayOfWeek(edate));
    } else if (period === "month") {
        let month = new Date(today.setDate(today.getDate() - 30));
        sdate = month.toISOString().substring(0, 10);
        console.log(sdate, getDayOfWeek(sdate), edate, getDayOfWeek(edate));
    } else if (period === "3month") {
        let month3 = new Date(today.setDate(today.getDate() - 90));
        sdate = month3.toISOString().substring(0, 10);
        console.log(sdate, getDayOfWeek(sdate), edate, getDayOfWeek(edate));
    }

    let stext =
        sdate.substring(0, 4) +
        "." +
        sdate.substring(5, 7) +
        "." +
        sdate.substring(8, 10) +
        "(" +
        getDayOfWeek(sdate) +
        ")"; // 시작일
    let etext =
        edate.substring(5, 7) +
        "." +
        edate.substring(8, 10) +
        "(" +
        getDayOfWeek(edate) +
        ")"; // 종료일
    $("#info-text").text(stext + " ~ " + etext);
}

function getDayOfWeek(textDate) {
    //ex) getDayOfWeek('2022-06-13')
    const week = ["일", "월", "화", "수", "목", "금", "토"];
    const dayOfWeek = week[new Date(textDate).getDay()];
    return dayOfWeek;
}

function searchItem(el) {
    if (!$(el).val()) {
        goHtml(items);
        return;
    }

    let array = items.filter(
        (item) => item.textDisplay.indexOf($(el).val()) >= 0
    );
    //let array2 = items.filter((item) => item.videoId.indexOf($(el).val()) >= 0);
    let array3 = items.filter(
        (item) => item.publishedAt.indexOf($(el).val()) >= 0
    );
    let array4 = items.filter(
        (item) => item.authorName.indexOf($(el).val()) >= 0
    );
    array = array.concat(array3, array4);

    const set = new Set(array);
    const uniqueArr = [...set];
    if (uniqueArr.length == 0) {
        $("tbody > tr").html();
        $("tbody").html(
            `<tr><td colspan="6" height="50px"> <div style='text-align:center'>자료가 없습니다.</div></td></tr>`
        );
    } else {
        goHtml(array);
    }
}