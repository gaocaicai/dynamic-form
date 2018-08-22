
// 简单的数据验证
function validator (data) {
  if (!data) {
    throw new Error('item data must be an Object.')
  } else if (!data.$id) {
    throw new Error('item $id is unvalidated.')
  } else if (!data.$type) {
    throw new Error('item $type is unvalidated.')
  }
}
//防止转义
function encodeHtmlStr(str) {
    var replaceRule = [
        {
            symbol: '&',
            html: '&amp;'
        },
        //下述方法有问题,字符串中如有空格,会多加空格
        //white-space: pre-wrap; 能实现同样效果,并支持ie9, 故注释掉
        // {
        //     symbol: '[\\u0020]',
        //     html: '&nbsp;\u0020'
        // },
        {
            symbol: '[\\u0009]',
            html: '&nbsp;&nbsp;&nbsp;&nbsp;\u0020'
        },
        {
            symbol: '<',
            html: '&lt;'
        },
        {
            symbol: '>',
            html: '&gt;'
        },
        {
            symbol: '\'',
            html: '&#39;'
        },
        {
            symbol: '\\n\\r',
            html: '<br/>'
        },
        {
            symbol: '\\r\\n',
            html: '<br/>'
        },
        {
            symbol: '\\n',
            html: '<br/>'
        }
    ];

    for (var i = 0, len = replaceRule.length; i < len; i++) {
        var rule = replaceRule[i];
        var regExp = new RegExp(rule.symbol, 'g');
        str = str.replace(regExp, rule.html);
    }

    return str;
};


