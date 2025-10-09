
import { ref } from 'vue';

export function useWeatherIcons() {
    // 天气图标映射配置
    const iconMap = {
        // 晴天相关
        '01d': '晴天',      // 白天晴天
        '01n': '晚晴天',    // 夜晚晴天

        // 少云/多云相关
        '02d': '少云',      // 白天少云
        '02n': '晚多云',    // 夜晚少云
        '03d': '多云',      // 白天散云
        '03n': '晚多云',    // 夜晚散云
        '04d': '阴天',      // 白天阴天
        '04n': '阴天',      // 夜晚阴天

        // 降雨相关
        '09d': '阵雨',      // 白天小雨
        '09n': '阵雨',      // 夜晚小雨
        '10d': '中雨',      // 白天中雨
        '10n': '中雨',      // 夜晚中雨

        // 雷雨
        '11d': '雷阵雨',    // 白天雷雨
        '11n': '雷阵雨',    // 夜晚雷雨

        // 降雪相关
        '13d': '小雪',      // 白天雪
        '13n': '小雪',      // 夜晚雪

        // 雾/霾
        '50d': '雾',        // 白天雾
        '50n': '雾'         // 夜晚雾
    };

    // 天气描述映射
    const descriptionMap = {
        '01d': '晴天', '01n': '晴朗夜晚',
        '02d': '少云', '02n': '少云夜晚',
        '03d': '多云', '03n': '多云夜晚',
        '04d': '阴天', '04n': '阴天夜晚',
        '09d': '阵雨', '09n': '阵雨夜晚',
        '10d': '中雨', '10n': '中雨夜晚',
        '11d': '雷阵雨', '11n': '雷阵雨夜晚',
        '13d': '小雪', '13n': '小雪夜晚',
        '50d': '雾', '50n': '雾夜晚'
    };

    // 备用映射方案
    const fallbackMap = {
        '晚晴天': '晴天',
        '晚多云': '多云',
        '中雨': '阵雨',
        '小雪': '阴天',
        '雷阵雨': '阵雨',
        '雾': '阴天'
    };

    // 图标URL缓存 - 用于存储已经创建的URL对象
    const iconUrlCache = ref({});

    // 常用天气图标列表，用于预加载
    const commonIcons = [
        '01d', '01n', // 晴天
        '02d', '02n', // 少云
        '03d', '03n', // 多云
        '04d', '04n', // 阴天
        '09d', '09n', // 阵雨
        '10d', '10n'  // 中雨
    ];

    // 预加载常用图标
    const preloadCommonIcons = () => {
        // 使用requestAnimationFrame确保预加载在渲染之后进行，不阻塞页面加载
        requestAnimationFrame(() => {
            commonIcons.forEach(iconCode => {
                // 预加载但不阻塞主线程
                setTimeout(() => {
                    getWeatherIcon(iconCode);
                }, 0);
            });
        });
    };

    // 获取天气图标URL（带缓存功能）
    const getWeatherIcon = (iconCode) => {
        if (!iconCode) return '';

        // 优先从缓存获取，避免重复创建URL对象
        if (iconUrlCache.value[iconCode]) {
            return iconUrlCache.value[iconCode];
        }

        // 获取对应的中文图标名称
        const iconName = iconMap[iconCode] || '晴天';

        try {
            // 尝试动态导入图标文件
            const iconUrl = new URL(`../assets/img/${iconName}.svg`, import.meta.url).href;
            
            // 存入缓存
            iconUrlCache.value[iconCode] = iconUrl;
            return iconUrl;
        } catch (error) {
            console.warn(`图标文件未找到: ${iconName}.svg, 错误:`, error);

            // 使用备用图标
            const fallbackName = fallbackMap[iconName] || '晴天';

            try {
                const fallbackUrl = new URL(`../assets/img/${fallbackName}.svg`, import.meta.url).href;
                
                // 存入缓存
                iconUrlCache.value[iconCode] = fallbackUrl;
                return fallbackUrl;
            } catch {
                // 最终回退到晴天图标
                try {
                    const finalFallbackUrl = new URL('../assets/img/晴天.svg', import.meta.url).href;
                    
                    // 存入缓存
                    iconUrlCache.value[iconCode] = finalFallbackUrl;
                    return finalFallbackUrl;
                } catch {
                    console.error('连晴天图标都不存在！');
                    return '';
                }
            }
        }
    };

    const getWeatherDescription = (iconCode) => {
        return descriptionMap[iconCode] || '未知天气';
    };

    return {
        getWeatherIcon,
        getWeatherDescription,
        preloadCommonIcons
    };
}