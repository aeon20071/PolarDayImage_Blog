function PicScroll(element, opt) {
    var _this = this
    this.element = element
    // 上滚速度
    this.speedUp = opt.speedUp || 800
    // 下滚速度
    this.speedDown = opt.speedDown || 500
    $(this.element).hover(function () {
        var $img = $(this).find('img')
        var eleH = $(this).height()
        var imgH = $img.height()
        var H = imgH - eleH
        if (imgH <= eleH) {
            return
        }
        $img.stop().animate({ top: -H + 'px' }, _this.speedUp);
    }, function () {
        $(this).find('img').stop().animate({ top: 0 }, _this.speedDown);
    });

}