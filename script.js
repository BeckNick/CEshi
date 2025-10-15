// 配置后端API地址 - 部署时需要修改为你的服务器地址
const API_BASE_URL = 'frp-any.com:58055';

// DOM元素
const messageForm = document.getElementById('messageForm');
const messagesList = document.getElementById('messagesList');

// 页面加载时获取所有留言
document.addEventListener('DOMContentLoaded', () => {
    loadMessages();
});

// 加载留言
async function loadMessages() {
    try {
        messagesList.innerHTML = '<div class="loading">正在加载留言...</div>';
        
        const response = await fetch(`${API_BASE_URL}/messages`);
        
        if (!response.ok) {
            throw new Error('获取留言失败');
        }
        
        const messages = await response.json();
        displayMessages(messages);
    } catch (error) {
        console.error('Error:', error);
        messagesList.innerHTML = '<div class="error">加载留言失败，请稍后重试</div>';
    }
}

// 显示留言
function displayMessages(messages) {
    if (messages.length === 0) {
        messagesList.innerHTML = '<div class="loading">暂无留言，成为第一个留言的人吧！</div>';
        return;
    }
    
    messagesList.innerHTML = '';
    
    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = 'message-card';
        
        const date = new Date(message.created_at).toLocaleString('zh-CN');
        
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-author">${escapeHtml(message.name)}</span>
                <span class="message-date">${date}</span>
            </div>
            <div class="message-content">${escapeHtml(message.message)}</div>
        `;
        
        messagesList.appendChild(messageElement);
    });
}

// 提交新留言
messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(messageForm);
    const name = formData.get('name');
    const message = formData.get('message');
    
    try {
        const response = await fetch(`${API_BASE_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, message }),
        });
        
        if (!response.ok) {
            throw new Error('提交留言失败');
        }
        
        // 清空表单
        messageForm.reset();
        
        // 显示成功消息
        showMessage('留言提交成功！', 'success');
        
        // 重新加载留言
        loadMessages();
    } catch (error) {
        console.error('Error:', error);
        showMessage('提交留言失败，请稍后重试', 'error');
    }
});

// 显示消息
function showMessage(text, type) {
    const messageElement = document.createElement('div');
    messageElement.className = type;
    messageElement.textContent = text;
    
    // 插入到表单前
    messageForm.parentNode.insertBefore(messageElement, messageForm);
    
    // 3秒后移除消息
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

// 转义HTML，防止XSS攻击
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
