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

    // 우측 상단 입찰 드롭다운
    $('.hdr-bid-btn').click(function(e) {
        e.stopPropagation();
        $(this).closest('.hdr-bid').toggleClass('open');
    });
    // 메뉴 안을 누른 건 닫지 않는다 (링크 이동은 그대로)
    $('.hdr-bid-menu').click(function(e) { e.stopPropagation(); });
    $(document).click(function() { $('.hdr-bid').removeClass('open'); });
    $(document).keydown(function(e) {
        if (e.which === 27) $('.hdr-bid').removeClass('open');
    });
});
