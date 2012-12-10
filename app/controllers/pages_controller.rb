class PagesController < ApplicationController
	expose(:background) do 
		"http://placehold.it/150x150"
	end # background
	expose(:texts) do 
		{
			:catch_phrase => "Harbor Metal" ,
			:slogan => "Factory Assets Governing System"
		}
	end # texts
	expose(:focus) do 
		{ 
			:link => plants_path, 
			:content => "Factories", 
			:header => "View the factories index" 
		}
	end # focus
	expose(:tabs) do
		["http://placehold.it/270x333" ,"http://placehold.it/270x333" ,"http://placehold.it/270x333"].map do |n, icon|
			{
				:icon => icon ,
				:header => t("po_header_#{n}", :scope => [:page, :controller, :home]) ,
				:content => t("po_content_#{n}", :scope => [:page, :controller, :home]) ,
				:link => "#"
			}
		end # map icon
	end # tabs

  
  def home

  end

  def about
  end

  def faq
  end
end
