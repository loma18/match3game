# Match-3 游戏项目

一个完整的消消乐游戏应用，包含前端和后端部分。使用Vue 3开发前端，Spring Boot开发后端，支持游戏存档和高分记录功能。

## 项目结构

项目分为两个主要部分：

- `match3-game`：Vue 3 + Pinia + Vite构建的前端应用
- `match3-server`：Spring Boot + JPA + H2数据库构建的后端应用

## 功能特点

- 经典的Match-3消消乐游戏玩法
- 使用鼠标拖拽或点击交换方块
- 支持触摸屏设备
- 平滑动画和视觉效果
- 分数系统和关卡进度
- 游戏存档功能 - 可随时保存游戏进度并在之后继续
- 高分榜记录

## 技术栈

### 前端
- Vue 3
- TypeScript
- Pinia (状态管理)
- Vite (构建工具)
- Axios (HTTP请求)

### 后端
- Java 1.8
- Spring Boot 2.7.x
- Spring Data JPA
- H2数据库
- RESTful API

## 安装与运行

### 前提条件
- Node.js 18+
- Java 1.8
- Maven

### 运行后端
1. 打开命令行窗口
2. 导航到后端项目目录：
```
cd match3-server
```
3. 使用Maven编译并运行项目：
```
mvn spring-boot:run
```
4. 后端服务将在 http://localhost:8080 启动

### 运行前端
1. 打开新的命令行窗口
2. 导航到前端项目目录：
```
cd match3-game
```
3. 安装依赖：
```
npm install
```
4. 启动开发服务器：
```
npm run dev
```
5. 前端应用将在 http://localhost:5173 启动

## 如何玩

1. 在欢迎屏幕输入您的名字
2. 如果有保存的游戏，可以选择继续上次游戏或开始新游戏
3. 拖动或点击相邻的方块来交换它们
4. 匹配三个或更多相同颜色的方块以获得分数
5. 使用右上角的暂停按钮可以暂停游戏并保存进度

## API 端点

### 分数 API
- `GET /api/scores` - 获取所有高分记录
- `GET /api/scores/player/{playerName}` - 获取指定玩家的分数
- `POST /api/scores` - 保存新的分数记录

### 存档 API
- `POST /api/saves` - 保存游戏状态
- `GET /api/saves/load/{playerName}` - 加载指定玩家的活动存档
- `GET /api/saves/player/{playerName}` - 获取指定玩家的所有存档
- `DELETE /api/saves/{id}` - 删除指定ID的存档

## 开发

### 构建前端生产版本
```
cd match3-game
npm run build
```

### 数据库
默认使用H2数据库，数据存储在`match3-server/data/match3db`文件中。
H2控制台可通过 http://localhost:8080/h2-console 访问（用户名：sa，密码：password）。

## 许可
MIT 