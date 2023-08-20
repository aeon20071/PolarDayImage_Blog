function modelTost() {
	let tem = "";
	let imgArr= [];
	let tems = '<div class="modelTost">' +
					'<div class="modelTostChile">' +
						'<p>摄影细节 <span class="modelClose">×</span></p>' +
						'<div class="swiper-container">' +
							'<div class="swiper-wrapper"></div>' +
							'<div class="swiper-button-next"></div>' +
							'<div class="swiper-button-prev"></div>' +
						'</div>' +
					'</div>'+
				'</div>'

	function imgClick() {
		$('img').click(function() {
			tem=''//初始化防止多追加；
			imgArr= [];
			let slideIndex = 0;
			let attrs = $(this).attr('src');
			//	点击在body中追加弹框
			$('body').append(tems);
			//	找到当前图片的最外层父元素下的所有图片
			let imgArrList = $(this).parents('.modelTostParents').find('img');
			//	追加图片数组
			for(var i = 0 ;i < imgArrList.length;i++){
				imgArr.push(imgArrList.eq(i).attr('src'))
			}
			//	图片数组与点击src做匹配,获取对应index
			imgArr.forEach((item,index) => {
				if(attrs === item){
					slideIndex = index
				}
			})
			//	弹框中追加对应数组swiper
			for(var i = 0; i < imgArrList.length; i++) {
				tem += "<div class='swiper-slide'><img src='" + imgArr[i] + "'></div>"
			}
			$(".swiper-wrapper").append(tem);
			$('.modelTost').fadeIn(500);
			
			var mySwiper = new Swiper('.swiper-container', {
				navigation: {
					nextEl: '.swiper-button-next',
					prevEl: '.swiper-button-prev',
				},
				observer: true,
				observeParents: true,
				initialSlide: slideIndex
			});
			$('.swiper-container').children('.swiper-notification').eq(0).siblings('.swiper-notification').remove()
		})
	}
	$('body').on('click','.modelClose',function(){
		$('.modelTost').remove();
	})
	imgClick()
}