module UsersHelper
	@@user_filters = [
		lambda do |user|
			!user.nil?
		end , # level 0 - anonymous
		lambda do |user|
			user.level > 1
		end , # level 1 - factory worker
		lambda do |user|
			user.level > 2
		end , # level 2 - office logistics
		lambda do |user|
			user.level > 3
		end , # level 3 - office sales
		lambda do |user|
			user.level > 4
		end , # level 4 - office accounting
		lambda do |user|
			user.level > 5
		end , # level 5 - office management
		lambda do |user|
			user.level > 6
		end , # level 6 - office Chief
		lambda do |user|
			user.level > 7
		end , # level 7 - data admin
	] # user_filters
	def allow_management
		filter_to 5
	end # allow_management

	def allow_sales
		filter_to 3
	end # allow_sales

	private
	def filter_to(level)
		result = @@user_filters.inject([true, 0]) do |mem, source|
			if mem.first == false or mem.last == level
				break mem
			end
			mem[0] &&= source.call(current_user)
			mem[1] += 1
			mem
		end.first # inject
		flash[:notice] = t(:access_denied, :scope => [:user, :helper, :filter])
		redirect_to new_user_session_path unless result == true
	end # filter_to
end
