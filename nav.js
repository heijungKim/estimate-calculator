$(function() {
    // 현재 활성 항목이 있는 카테고리 자동 열기
    var $activeItem = $('.nav-cat-items .nav-item.active');
    if ($activeItem.length) {
        $activeItem.closest('.nav-category').addClass('open active-cat');
    }

    // 카테고리 헤더 클릭 → 개별 토글 (다른 카테고리 유지)
    $('.nav-cat-header').click(function() {
        $(this).closest('.nav-category').toggleClass('open');
    });
});
