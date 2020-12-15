let express=require("express"),
	app=express(),
	mongoose=require("mongoose"),
	request=require("request");

let totalnewusers=0,totalnewwines=0;

app.set("view engine","ejs");

mongoose.set('useNewUrlParser',true);
mongoose.set('useUnifiedTopology',true);
mongoose.set('useFindAndModify',false);

mongoose.connect("mongodb://localhost/API_database");
let userSchema=new mongoose.Schema({
	image:String,
	name:String,
	userName:String,
	eMail:String,
	password:String,
});
let users=mongoose.model("users",userSchema);
let wineSchema=new mongoose.Schema({
	image:String,
	name:String,
	instruction:String,
});
let wines=mongoose.model("wines",wineSchema);
//*******************************************************************
//****************Data poll for every 5 seconds**********************
//*******************************************************************
setInterval(function(){
	request("https://randomuser.me/api/",{json:true},function(err,response,newuser){
		if(typeof newuser.results!="undefined"){
			users.create({
				image:newuser.results[0].picture.large,
				name:newuser.results[0].name.title +" "+ newuser.results[0].name.first +" "+ newuser.results[0].name.last,
				userName:newuser.results[0].login.username,
				eMail:newuser.results[0].email,
				password:newuser.results[0].login.password,
			},function(er,user){
				totalnewusers+=1;
				console.log("Users count:"+totalnewusers);
			});
		}	
	});
	request("https://www.thecocktaildb.com/api/json/v1/1/random.php",{json:true},function(err,response,newwine)	   {
		if(typeof newwine.drinks!="undefined"){
			wines.create({
				image:newwine.drinks[0].strDrinkThumb,
				name:newwine.drinks[0].strDrink,
				instruction:newwine.drinks[0].strInstructions
			},function(er,wine){
				totalnewwines+=1;
				console.log("Wines count:"+totalnewwines);
			});
		}	
	});
},5000);

//*******************************************************************
//****************************ROUTE**********************************
//*******************************************************************

app.get("/",function(req,res){	wines.find().sort({_id:-1}).limit(totalnewwines).exec(function(err,unseenwines){	users.find().sort({_id:-1}).limit(totalnewusers).exec(function(err,unseenusers){
			totalnewwines=0;
			totalnewusers=0;
			return res.render("details",{latestusers:JSON.stringify(unseenusers),latestwines:JSON.stringify(unseenwines)});
		});
	});
});

app.listen(3000,function(req,res){
	console.log("API fetching Server started!");
});