
/*
 * 설정
 */

module.exports = {
	server_port: 3000,
	db_url: 'mariadb://127.0.0.1:3306/local',
	db_schemas: [
        {file:'./user_schema', collection:'users6', schemaName:'UserSchema', modelName:'UserModel'}
        ,{file:'./post_schema', collection:'post', schemaName:'PostSchema', modelName:'PostModel'}
	],
	route_info: [
        {file:'./user', path:'/user/add', method:'adduser', type:'post'}
        ,{file:'./user', path:'/user/get/:id', method:'getuser', type:'get'}
        ,{file:'./user', path:'/user/edit/', method:'edituser', type:'post'}
        ,{file:'./user', path:'/user/delete/:id', method:'deluser', type:'get'}
		,{file:'./proj', path:'/proj/get/', method:'listproj', type:'get'}
		,{file:'./proj', path:'/proj/get/:id', method:'listproj', type:'get'}
		,{file:'./proj', path:'/proj/add', method:'addproj', type:'post'}
		,{file:'./proj', path:'/proj/edit/', method:'editproj', type:'post'}
		,{file:'./proj', path:'/proj/delete/:id', method:'delproj', type:'get'}
		,{file:'./post', path:'/post/get', method:'listpost', type:'get'}
		,{file:'./post', path:'/post/get/:id', method:'listpost', type:'get'}
		,{file:'./post', path:'/post/add', method:'addpost', type:'post'}
		,{file:'./post', path:'/post/edit', method:'editpost', type:'post'}
		,{file:'./post', path:'/post/delete/:id', method:'delpost', type:'get'}
		,{file:'./login', path:'/login/kakao', method:'kakao', type:'get'}
		,{file:'./login', path:'/login/local', method:'local', type:'get'}
		,{file:'./logout', path:'/logout', method:'logout', type:'get'}
		
	],
}