

/*
 * 설정
 */

module.exports = {
	server_port: 3000,
	db_url: 'mariadb://127.0.0.1:3306/local',
	db_host:'127.0.0.1',
	db_pw:'1234',
	db_user:'root',
	db_port:3306, 
	db_name:'prac',
	db_schemas: [
        {file:'./user_schema', collection:'users6', schemaName:'UserSchema', modelName:'UserModel'}
        ,{file:'./post_schema', collection:'post', schemaName:'PostSchema', modelName:'PostModel'}
	],
	route_info: [
        // {file:'./user', path:'/user/add', method:'adduser', type:'post'}
        // ,{file:'./user', path:'/user/get/:id', method:'getuser', type:'get'}
        // ,{file:'./user', path:'/user/edit/', method:'edituser', type:'post'}
        // ,{file:'./user', path:'/user/delete/:id', method:'deluser', type:'get'}
		{file:'./proj', path:'/proj/getall/', method:'getALLproj', type:'get'}
	   	,{file:'./proj', path:'/proj/get/:id', method:'getproj', type:'get'}
	    ,{file:'./proj', path:'/proj/add', method:'addproj', type:'post'}
		,{file:'./proj', path:'/proj/edit/:id', method:'editproj', type:'put'}
		,{file:'./proj', path:'/proj/delete/:id', method:'delproj', type:'delete'}
		,{file:'./proj', path:'/proj/search', method:'searchprojbytitle', type:'post'}
		,{file:'./post', path:'/post/getall', method:'getALLpost', type:'get'}
		,{file:'./post', path:'/post/get/:id', method:'getpost', type:'get'}
		,{file:'./post', path:'/post/add', method:'addpost', type:'post'}
		,{file:'./post', path:'/post/edit/:id', method:'editpost', type:'put'}
		,{file:'./post', path:'/post/delete/:id', method:'delpost', type:'delete'}
		,{file:'./post', path:'/post/search', method:'searchpostbytitle', type:'post'}

		// ,{file:'./login', path:'/login/kakao', method:'kakao', type:'get'}
		// ,{file:'./login', path:'/login/local', method:'local', type:'get'}
		// ,{file:'./logout', path:'/logout', method:'logout', type:'get'}
		
	],
}
