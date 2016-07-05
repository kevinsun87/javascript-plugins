//图片轮播
//改进功能：1.预加载切换
/**
 * @parameter Object: options 函数参数
 * @parameter String: options["hover"] 当前按钮选中样式 （默认"current"）
 * @parameter Number: options["speed"] 轮播速率 （默认"300"）
 * @parameter Number: options["interval"] 轮播间隔 （默认"500"）
 * @parameter String: options["changeWay"] 切换方式 （值："up", "left", "fade", "lazyLoad";默认"up"）
 * @parameter Boolean: options["isAuto"] 是否自动轮播 （默认"true"）
 * @parameter String: options["prevBtn"] 上一个按钮
 * @parameter String: options["nextBtn"] 下一个按钮
 * 调用方式：$(".slide_a").adPlayer(); 其中hover, speed, interval, changeWay, isAuto, arrUrl, prevBtn, nextBtn都为选填项
 * 
 * Author: JJ-SUN
 * Time: 2012/11/26 17:09
 */

$.fn.extend({
	bannPlayer: function(options){
		options = $.extend({
			hover: "current",
			speed: 300,
			interval: 3000,
			changeWay: "up",
			isAuto: true,
			arrUrl: null
		}, options);
		
		var picBox = $(this).children().eq(0),
			btns = $(options.btnGroup).children(),
			changeType = "",
			len = btns.length,
			index = 0,
			prevIndex = 0,
			clearT = null,
			timeoutId = null;
				
		if(len == 1){
			return false;
		}	
		
		//初始化当前按钮位置
		btns.eq(0).addClass(options.hover);
		
		//自动轮播开关按钮
		if(options.switchBtn){
			var switchBtn = $(options.switchBtn);
			if(options.isAuto){
				switchBtn.get(0).innerHTML = "‖";
				switchBtn.click(function(){
					if(switchBtn.get(0).innerHTML == "‖"){
						switchBtn.get(0).innerHTML = "▶";
						clearTimeout(timeoutId);
						options.isAuto = false;
					}else{
						switchBtn.get(0).innerHTML = "‖";
						options.isAuto = true;
					}
				});
			}else{
				switchBtn.get(0).innerHTML = "▶";
				switchBtn.click(function(){
					if(switchBtn.get(0).innerHTML == "▶"){
						switchBtn.get(0).innerHTML = "‖";
						options.isAuto = true;
					}else{
						switchBtn.get(0).innerHTML = "▶";
						clearTimeout(timeoutId);
						options.isAuto = false;
					}
				});
			}
		}
		
		//Dom对象交换
		var exchange = function(obj1, obj2){
			var temp = null;
			temp = obj1;
			obj1 = obj2;
			obj2 = temp;
			picLi = obj1, picLiSib = obj2;	
		};
		
		//淡出图片
		var picHide = function(){
			picLi.stop(true, true).fadeOut(options.speed);
		}
		
		//替换图片
		var picReplace = function(index){
			picLiSib.find("img").attr("src", options.arrUrl[index]);
			picLiSib.children().attr("href", options.arrUrl[index]);
			picLiSib.stop(true, true).fadeIn(options.speed);
			exchange(picLi, picLiSib);
		};
		
		//加载图片
		var loading = function(index){
			picHide();
			var img = document.createElement("img");
			$(img).load(function(){
				loadStatus[index] = true;
				picReplace(index);
			}).attr("src", options.arrUrl[index]);
		};
		
		//图片预加载功能
		var preloading = function(index){
			if(loadStatus[index]){
				if(loadStatus.length == options.arrUrl.length){
					preloading = function(index){
						picHide();
						picReplace(index);
					}
					preloading(index);
				}else{
					picHide();
					picReplace(index);
				}
			}else{
				loading(index);
			}
		};
		
		//判断切换类型
		if(options.changeWay == "up" || options.changeWay == "left"){
			var rollWay = "", rollWidth, style = {};
			changeType = "rollmode";
			rollWay = options.changeWay == "left" ? "left" : "top"; 
			rollWidth = options.changeWay == "left" ? $(this).width() : $(this).height();
		}else if(options.changeWay == "fade"){
			var pics = picBox.children(), currentIndex = -1, oldIndex = len-1;
			pics.eq(oldIndex).siblings().hide();
			changeType = "fademode";
		}else if(options.changeWay == "lazyLoad"){
			var picLi = picBox.children().eq(index), picLiSib = picLi.siblings(), loadStatus = [];
			loading(index);
			changeType = "lazymode";
		}
						
		//切换功能
		var change = function(index){
			if(changeType == "fademode"){
				change = function(index){
					currentIndex = len-index-1;
					pics.eq(oldIndex).stop(true, true).fadeOut(options.speed);
					pics.eq(currentIndex).stop(true, true).fadeIn(options.speed);
					btnsChange(index);
					oldIndex = currentIndex;
				}
			}else if(changeType == "rollmode"){
				change = function(index){
					style[rollWay] = -(rollWidth*index);
					picBox.stop(true, true).animate(style, options.speed);
					btnsChange(index);
				}
			}else if(changeType == "lazymode"){
				change = function(index){
					preloading(index);
					btnsChange(index);
				}
			}
			return change(index);			
		};
		
		//当前按钮切换
		var btnsChange = function(index){
			btns.eq(index).addClass(options.hover).siblings().removeClass(options.hover);
			prevIndex = index;
		};
		
		//判断是否自动滚动
		var autoPlay = function(){
			timeoutId = setTimeout(function(){
				index++;				
				if(index == len){
					index = 0;
				};
				change(index);
				timeoutId = setTimeout(arguments.callee, options.interval);
			}, options.interval);	
		};
		if(options.isAuto){autoPlay();}
		
		//左右按钮控制切换	
		if(options.prevBtn && options.nextBtn){
			var pairBtns = true;
			$(options.prevBtn).click(function(){
				if(index == 0){
					index = len-1;
				}else{
					index -= 1;
				}
				change(index);
			});
			$(options.nextBtn).click(function(){
				if(index == len-1){
					index = 0;
				}else{
					index += 1;
				}
				change(index);
			});
		}
			
		//按钮获得焦点
		btns.mouseenter(function(){			
			index = btns.index(this);
			if(index != prevIndex){
				clearTimeout(clearT);
				clearT = setTimeout(function(){
					change(index);
				}, 150);
			}
		});
		
		//广告失去焦点
		$(this).mouseleave(function(){
			if(pairBtns){
				//$(options.prevBtn).stop(true, true).fadeOut();
				//$(options.nextBtn).stop(true, true).fadeOut();
			}
			if(options.isAuto){autoPlay();}
		});
		//广告获得焦点
		$(this).mouseenter(function(){
			if(pairBtns){
				//$(options.prevBtn).stop(true, true).fadeTo("slow", 0.5);
				//$(options.nextBtn).stop(true, true).fadeTo("slow", 0.5);
			}
			if(options.isAuto){clearTimeout(timeoutId);}	
		});	
		//按钮组失去焦点
		$(btns).mouseleave(function(){
			if(pairBtns){
				//$(options.prevBtn).stop(true, true).fadeOut();
				//$(options.nextBtn).stop(true, true).fadeOut();
			}
			if(options.isAuto){autoPlay();}
		});
		//按钮组获得焦点
		$(btns).mouseenter(function(){
			if(pairBtns){
				//$(options.prevBtn).stop(true, true).fadeTo("slow", 0.5);
				//$(options.nextBtn).stop(true, true).fadeTo("slow", 0.5);
			}
			if(options.isAuto){clearTimeout(timeoutId);}	
		});		
	}
});
