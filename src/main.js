import banner from './components/banner/script';

$(function(){
	window.test = () => $('h1').html(banner.msg);
});