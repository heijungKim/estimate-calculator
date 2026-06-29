$(function() {
    // 현재 활성 항목이 있는 카테고리 자동 열기
    var $activeItem = $('.nav-cat-items .nav-item.active');
    if ($activeItem.length) {
        $activeItem.closest('.nav-category').addClass('open active-cat');
    }

    // 카테고리 헤더 클릭 → 아코디언 토글
    $('.nav-cat-header').click(function() {
        var $cat = $(this).closest('.nav-category');
        var wasOpen = $cat.hasClass('open');
        $('.nav-category').removeClass('open');
        if (!wasOpen) $cat.addClass('open');
    });
});
