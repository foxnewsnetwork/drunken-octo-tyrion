module GlobalHelper
	def logo
	  	"http://placehold.it/150x75"
	end # logo

	def navigation
		{ :factories => plants_path }
	end # navigation

	def actions
		{
	  		:signin => new_user_session_path ,
	  		:signup => new_user_registration_path
	  	}
	end # actions

	def user_signin_path
		new_user_session_path
	end # user_signin_path

	def user_signup_path
		new_user_registration_path
	end # user_signup_path

	def company
		"Harbor Metal"
	end # company

	def externals
		{
			"email" => "https://mail.google.com"
		}
	end # externals

	def sentencify string
		string.gsub(/\n\r/, "<p />").gsub(/\n/, "<br />")
	end # sentencify

	def weight_units
		['pounds','tons','metric tons']
	end # weight_units
end # GlobalHelper