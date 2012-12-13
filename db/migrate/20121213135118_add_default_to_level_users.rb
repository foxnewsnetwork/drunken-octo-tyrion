class AddDefaultToLevelUsers < ActiveRecord::Migration
  def change
  	change_column_default :users, :level, 1
  end
end
