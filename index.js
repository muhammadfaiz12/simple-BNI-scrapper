const rp = require('request-promise');
const promise = require('bluebird'); 
const cheerio = require('cheerio'); 
const fs = require('fs'); 
const options = { 
	uri: `https://m.bnizona.com/index.php/category/index/promo`, 
	transform: function (body) { 
	return cheerio.load(body); 
	} 
};

async function main(){ 

	var hasil = [] 
	await rp(options).then(async $ => { 
		var urls = await get_categories($); 
		for (var i =0; i < urls.length; i++){ 
			var temp = []
			temp.push(urls[i]['judul'])
			let result = await get_html_categories(urls[i]['url']) 
			temp.push(result)
			hasil.push(temp) 
		} 
		
		console.log(hasil)
		//Write JSON file
	    fs.writeFile('solution.json', JSON.stringify(hasil, null, 3), function(err) {
	      if (err) {
	        console.log(err);
	      } else {
	        console.log("JSON saved to your folder");
	      }
	    });
		//var hasil_akhir = promise.map(urls, hasil) 
	}).catch((err) => { 
	console.log(err); 
	}); 
} 

function get_categories($){ 
	var menu = $('.menu').html(); 
	var list_url = []; 
	
	$('.menu').find('li').each(function(i, elem){ 
		list_url.push({'url' : $(this).find('a').attr('href'),
					  'judul' : $(this).find('a').text()
					  }); 
	}) 
	
	return list_url 
} 

async function get_html_categories(url){ 
	var options = { 
		uri: url, 
		transform: function (body) { 
		return cheerio.load(body); 
		} 
	}; 
	let promise = await rp(options).then($ => { 
		var list_hasil = [] 
		$('.list2').find('li').each(function(i, elem){ 
			var detail = $(this).find('a') 
			list_hasil.push({'title': $(detail).children('.promo-title').text(),
							'thumbnail': $(detail).find('img').attr('src'), 
							'valid until': $(detail).children('.valid-until').text(), 
							'merchant' : $(detail).children('.merchant-name').text(), 
							'link' : $(detail).attr('href') 
							}); 
		}) 
		return list_hasil 
	}) 
	.catch((err) => { 
	console.log("Exception catched"); 
	}); 
	return promise 
} 
main()