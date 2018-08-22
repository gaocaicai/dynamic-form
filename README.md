# dynamic-form

基于 Vue 的表单渲染器, 使用户能够通过使用一段预设的数据渲染出一个完整的表单

## 快速开始

1、引入依赖

`依赖`: vue.js, jquery.js, moment.js, daterangepicker.js

```html
<link rel="stylesheet" href="static/css/reset.css">
<script src="static/js/jquery-1.11.js"></script>
<script src="static/js/vue-2.5.14.js"></script>
<script src="static/js/moment.min.js"></script>
<script src="static/js/daterangepicker-3.03.js"></script>
```

2、引入插件

```html
<!-- #include 必须在 设置 ssi 后才能生效. 如未设置, 可直接把 form.html 中的代码复制到下方 -->
<!--#include virtual="./template/form.html" --> 
```

3、使用插件

```html
<div class="dynamic-form" id="dynamic-form">
    <form-element v-for="(item,index) in list"  :formconfig='item' :key="item.id" >
        <!-- 根据具体业务放具体内容 -->
        <template :slot='item.name' v-if="item.name=='notice'">
            <p>此处显示业务通告</p>
        </template>
    <form-element>
</div>
<script>
    var formList = [
        {
            "type":"text",
            "name":"active-name",
            "label":"活动名称",
            "defalut":"默认值",
            "el":{
                "placeHolder":"请输入活动名称",
            },
            "rules":[
                {
                    "require":true,
                    "tip":"活动名称不能为空",
                    "trigger": "blur"
                },
                {
                    "min":6,
                    "max":10,
                    "tip":"活动名称字符长度为6-10",
                    "trigger": "change"
                }
            ]
        }
    ]
    var form = new Vue({
        el:'#dynamic-form',
        data:{
            list: formList
        }
    });
</script>
```

## 属性

定义表单的数据，每一个 `Object` 代表一个表单元素，配置相应属性即可生成相应表单元素

| 属性名   | 类型   | 说明   |
| :----- | :----- | :----- |
| type | String | 类型, 如: text、checkbox、radio ... |
| name | String | 名称, 具有唯一性 ,可根据具体业务命名|
| label | String | 标题名 |
| defalut | String | 表单默认值 |
| el | Object | el 属性配置 |
| rules | Array | 验证规则 |

**属性示例:**

```js
// input 输入框
{ 
    "type":"text",  
    "name":"active-name",
    "label":"活动名称",
    "defalut":"默认值",
    "el":{
        "placeHolder":"请输入活动名称",
    },
    "rules":[
        {
            "require":true,  // 是否必填
            "tip":"活动名称不能为空"  // 错误提示
        },
        {
            "min":6,  // 最小长度为 6
            "max":10, // 最大长度为 10
            "tip":"活动名称字符长度为6-10"
        },
        {
            "mobile": true, // 是否为手机号
            "tip":"您输入的手机格式不对"
        },
        {
            "phone": true,  // 是否为固定电话
            "tip":"您输入的固定电话格式不对"
        },
        {
            "email": true, // 是否为邮箱
            "tip":"您输入的邮箱格式不对"
        }
    ]
}

// checkbox 多选框
{
    "type":"checkbox",
    "name":"active-purpose",
    "label":"活动性质",
    "defalut":[1,2],
    "options":[  // 可选值
        {
            "label":"线下活动",
            "value":"1"
        },
        {
            "label":"品牌曝光",
            "value":"2"
        },
        {
            "label":"地推",
            "value":"3·"
        },
        {
            "label":"促销折扣",
            "value":"4"
        },
    ],
    rules: [
        {
          require: true,
          tip: '活动性质不能为空'
        }
    ]
}

// radio 单选框
{
    "type":"radio",
    "name":"active-resource",
    "label":"特殊资源",
    "defalut":1,
    "options":[
        {
            "label":"线上品牌赞助",
            "value":"1"
        },
        {
            "label":"线下场地免费",
            "value":"2"
        }
    ]
}

// select 选择框
{
    "type":"select",
    "name":"active-area",
    "label":"活动区域",
    "defalut":0,
    "options":[
        {
            "label":"请选择活动区域",
            "value":"0"
        },
        {
            "label":"北京",
            "value":"1"
        },
        {
            "label":"上海",
            "value":"2"
        },
        {
            "label":"深圳",
            "value":"3"
        },
        {
            "label":"广东",
            "value":"4"
        }
    ]
}

// date 日期
{
    "type":"date",
    "name":"active-date",
    "label":"活动时间",
    "el":{
        "placeHolder":"请选择活动时间",
        "type":"double",  //单选日期还是多选日期 single || double
        "format":"YYYY-MM-DD"
    },
    "rules":[
        {
          "require": true,
          "tip":"活动日期不能为空"
        }
    ]
}

// upload 上传
{
    "type":"upload",
    "name":"active-picture",
    "label":"上传图片",
    // 上传函数, 填写该属性, 则忽略 uploadUrl, getToken, getFileUrl
    // upload: function(file, callback) {
    //    // TODO
    //    var url = 'xxx';
    //    // callback(url);
    // },
    uploadUrl: 'http://up-z2.qiniup.com',  // 上传地址
    getToken: function(callback) {  // 获取 token
        var token = '4_-TDy4ee6uZXdWFx5Te4-YGC_5GcIbeDR5EPeF4:LU2-GH_E6fv-0iWNZ2jl_Xd4WnE=:eyJzY29wZSI6IjIyMjIiLCJkZWFkbGluZSI6MTUzNDY3MzE5Mn0=';
        callback(token);
    },
    getFileUrl: function(res, callback) {  // 根据上传后的 response 获取 url
        var url = 'http://oqil1bd5m.bkt.clouddn.com/' + res.key;
        callback(url);
    },
    "rules":[
        {
          //图片上传的最大大小，单位kb
          "size":3000,
          "tip":"请上传大小为 3 Mb 以下的图片"
        },
        {
          // 上传的类型
          "suffix": ['jpg', 'png', 'jpeg'],
          "tip":"请上传jpg、png、jpeg类型的图片"
        },
    ]
}
```

## Slot

* 支持通过默认 `slot` 往表单尾部插入自定义 `VNode`,非必填项。