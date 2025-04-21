// 页脚链接优化脚本
document.addEventListener('DOMContentLoaded', function() {
    // 获取所有页脚链接
    const footerLinks = document.querySelectorAll('.footer-link');
    
    // 为空链接添加适当的行为
    footerLinks.forEach(link => {
        if (link.getAttribute('href') === '#') {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                // 根据链接文本决定行为
                const linkText = link.textContent.trim().toLowerCase();
                
                if (linkText === 'about us') {
                    alert('BrainBenchmark is a platform designed to help you test and improve your cognitive abilities through science-based tests.');
                } else if (linkText === 'contact') {
                    window.location.href = 'mailto:contact@braingame.cyou?subject=Inquiry%20from%20BrainBenchmark';
                } else if (linkText === 'privacy policy') {
                    alert('We respect your privacy. BrainBenchmark collects anonymous usage data to improve our tests. We never share your personal information with third parties.');
                }
            });
        }
    });
    
    // 添加跟踪事件
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            if (typeof gtag === 'function') {
                gtag('event', 'click', {
                    'event_category': 'link',
                    'event_label': link.getAttribute('href'),
                    'value': 1
                });
            }
        });
    });
}); 