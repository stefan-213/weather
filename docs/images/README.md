# README 截图 / README screenshots

[中文 README](../../README.md) · [English README](../../README.en.md)

两份 README 共用本目录中的图片。当前只预留文件名，尚未添加截图。

Both READMEs use the same images in this directory. The filenames below are reserved; no screenshots have been added yet.

| 文件名 / Filename | 展示内容 / Content | 建议比例 / Suggested ratio |
| --- | --- | --- |
| `dashboard.png` | 网页天气总览 / Web dashboard | 16:9 |
| `forecast.png` | 48 小时预报与多日趋势 / Forecasts and daily trends | 16:9 |
| `temperature-map.png` | 气温地图、图例与悬浮提示 / Map, legend, and tooltip | 4:3 |
| `ai-assistant.png` | AI 对话与回复 / AI conversation | 4:3 |
| `themes.png` | 明暗主题对比 / Light and dark comparison | 16:9 |
| `mobile.png` | 窄屏浏览器网页 / Narrow-screen web layout | 9:16 |

## 添加方式 / How to add images

中文：

1. 将截图按上表命名并放入本目录。
2. 在两份 README 中找到对应的图片行，删除外层 HTML 注释。
3. 删除对应的“图片待补充 / Screenshot placeholder”提示。
4. 如果改用 JPG、WebP 或 GIF，同步修改两份 README 中的文件路径。

English:

1. Save screenshots in this directory using the filenames above.
2. Remove the surrounding HTML comment from the matching image line in both READMEs.
3. Delete the corresponding placeholder notice.
4. If using JPG, WebP, or GIF instead, update the paths in both READMEs.

例如，将 / For example, change:

```markdown
<!-- ![WeatherInsight 网页天气总览](docs/images/dashboard.png) -->
```

改为 / To:

```markdown
![WeatherInsight 网页天气总览](docs/images/dashboard.png)
```
